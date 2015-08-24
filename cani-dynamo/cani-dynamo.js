Cani.dynamo = (function(dynamo){
    // expect schemas in conf.dynamo to map saves/loads, set indices, confirm permissions properly

    var schemas = [];
    dynamo.schemas = schemas;

    // grab these off the conf object
    var tables = [];
    dynamo.tables = tables;

    var dy; // aws dynamo singleton
    var dyconf;

    // ------------------------------- config -------------------------------------
    var DYCONF = function(conf, provider){
	dyconf = conf;
	schemas = conf.dynamo.schemas;
	if('initOn' in conf.dynamo)
	    conf.dynamo.initOn.map(function(pr){Cani.core.confirm(pr).then(dynamo.init);});
    };

    // dynamo boot hook
    Cani.core.on('config: dynamo', DYCONF);

    dynamo.init = function(){
	dy = new AWS.DynamoDB(dyconf.dynamo.awsConfigPack);

	dy.listTables(function(err, data){
	    // maybe parse the meaningless aws error messages?
	    if(err) console.log(err);

	    dynamo.tables = data.TableNames;
	    Cani.core.affirm('dynamo', dynamo);

	    // affirm dy.table foreach table
	    for(var i=dynamo.tables.length;i-->0;) Cani.core.affirm('dynamo.'+dynamo.tables[i],dynamo);
	});
    };

    // expose save and load functions

    // these names need to be fixed to the standard api
//------------------------------------------------------------------------------------------
    dynamo.write = function(type){
	// in cases where default options are non-EQ queries
	return '';
    };

//------------------------------------------------------------------------------------------
    dynamo.save = function(schemaName, query){
	if(typeof query === 'undefined') query = {};

	query = JSON.parse(JSON.stringify(query));

	var deferred = Q.defer(); // deferred.reject to do an error
	var schema = schemas[schemaName];
	
	// load the query into an AWS Item pack
	var pack = {};

	var tableName = schema.table.arn.split('/')[1]; // MIGHT FUCK UP

	for(var ff in query){
	    if(query[ff] === '') continue; //  no blank strings allowed
	    if(query[ff] === null) continue; // typeof null == 'object'

	    if(ff[0] === '$') continue; // don't write angular fields. also fuck php?

	    if(ff in schema.fields){
		// if in schema write to pack with type
		pack[ff] = {};

		if(schema.fields[ff] === 'N') query[ff] = ''+query[ff];

		pack[ff][schema.fields[ff]] = query[ff];

	    }else{
		// do the old style type guessing
		var type = dynamoType(query[ff]);

		if(type === 'U') continue; // shouldn't happen though		
		if(type === 'B') type = 'BOOL';

		pack[ff] = {};

		if(type === 'N') query[ff] = ''+query[ff]; // pass numbers as strings? psh
		if(type === 'L'){
		    // mashu?
		}

		if(type === 'M'){
		    // make query[ff] into a map of {"S":"value"} structures?
		    for(var ii in query[ff]){
			var ss = {};
			var tt = dynamoType(query[ff][ii]);
			if(tt === 'BOOL') ss[tt] = query[ff][ii];
			else ss[tt] = ''+query[ff][ii];
			query[ff][ii] = ss;
		    }
		}

		pack[ff][type] = query[ff];
	    }
	}

// replace this with a stupid USE TABLE FROM SCHEMA system
// maybe check that we have the keys for this index? meh

	dy.putItem({TableName:tableName, Item:pack}, function(err, res){
	    if(err){
		console.log(err);
		// parse aws error msg
		deferred.reject(err);
	    }
	    deferred.resolve(query);
	});

	return deferred.promise;
    };

//------------------------------------------------------------------------------------------
    dynamo.load = function(schemaName, query, options){
	var def = Q.defer();

	if(!options) options = {};
	if(!query) query = {};

// this doesn't implement options.FilterExpression IndexName Limit ProjectionExpression or ScanIndexForward
// or options.Select (count, attribute listables)

	var schema = schemas[schemaName];

	var table = schema.table;
	var tableName = table.arn.split('/')[1];

	var indexName;
	if(indexName = options.index)
	    if(table.indices.indexOf(indexName) === -1)
		throw 'index '+indexName+' not available';

	if(dynamo.tables.indexOf(tableName) === -1) throw 'table '+tableName+' not available';
	
	var pack = {};
	pack.TableName = tableName;
	// pack.IndexName left empty for default?

	// string build a KeyConditionExpression

	var hashAtt = table.hashKey;

	if((table.reservedAttributes||[]).indexOf(table.hashKey)>-1){
	    pack.ExpressionAttributeNames = {};
	    pack.ExpressionAttributeNames['#bsd'+table.hashKey] = table.hashKey;
	    hashAtt = '#bsd'+table.hashKey;
	}

	// start withe hashKey (ALWAYS EXACT QUERYING)
	if(!(table.hashKey in query)) throw 'query needs a hashkey ('+table.hashKey+') expression';
	pack.KeyConditionExpression = hashAtt + ' = :' + table.hashKey;
	// this prev evals the :table.hashKey to the ExpressionAttributeValue next, to check equality
	// this dynamoType I think is always S or N?
	pack.ExpressionAttributeValues = {};
	pack.ExpressionAttributeValues[':'+table.hashKey] = {};
	pack.ExpressionAttributeValues[':'+table.hashKey][dynamoType(query[table.hashKey])] = 
	    ''+query[table.hashKey];

	// now build KeyConditionExpression for the rest of the query
	for(var ff in query){
	    if(ff === table.hashKey) continue;
	    var type = (typeof query[ff])[0].toUpperCase(); // don't change this to dynamoType!
	    var cOp = '=';

// querying arrays? later

// remember to implement this comparison operator validation!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
	    if((type === 'O') && ('is an actual comparison operator query')){
		cOp = Object.keys(query[ff])[0];
		type = dynamoType(query[ff][cOp]);
		query[ff] = query[ff][cOp];
		// the idea here is to operate as {eq:'value'} or whatever

/*In addition to the usual Boolean comparison operators, you can also use CONTAINS, NOT_CONTAINS, and BEGINS_WITH for string matching, BETWEEN for range checking,  and IN to check for membership in a set.

In addition to the QueryFilter, you can also supply a ConditionalOperator. This logical operator (either AND or OR) is used to connect each of the elements in the QueryFilter.


https://aws.amazon.com/blogs/aws/improved-queries-and-updates-for-dynamodb/
*/


	    }else if(['S','N'].indexOf(type) === -1) continue;

	    var att = ff;

	    if((table.reservedAttributes||[]).indexOf(ff)>-1){
		pack.ExpressionAttributeNames = pack.ExpressionAttributeNames||{};
		pack.ExpressionAttributeNames['#bsd'+ff] = ff;
		att = '#bsd'+ff;
	    }

	    var expr;
	    if(cOp !== 'begins_with') expr = att+' '+cOp+' :'+ff;
	    else expr = 'begins_with('+att+', :'+ff+')';

	    pack.ExpressionAttributeValues[':'+ff] = {};
	    pack.ExpressionAttributeValues[':'+ff][type] = ''+query[ff];

	    if(query[ff] !== '')
		pack.KeyConditionExpression += ' and '+expr;
	}

	// that shit is ugly like a penguin's anus at feeding time!

	dy.query(pack, function(err, res){
	    // implement LastEvaluatedKey element large reads

	    //defer promise
	    if(err){
		console.log(err);
		def.reject(err);
	    }
	    //unpack the response
	    var pon = [];

	    for(var i=0; i<res.Items.length; ++i){
		var itm = {};
		for(var ff in res.Items[i])
		    itm[ff] = deref(res.Items[i][ff], Object.keys(res.Items[i][ff])[0]);
		pon.push(itm);
	    }
	    def.resolve(pon);
	});
  	return def.promise;
    };

//------------------------------------------------------------------------------------------
    dynamo.erase = function(schemaName, query){
	// make a deleteItem request to the table determined by schema

	// basically I'm going to require that you have the tableName, hash and range.
	// feel free to send me a collection of hash-range (maybe batch delete later)?

	var schema = schemas[schemaName];

	// autofill table for schemas with only one table
	var tableName  = schema.table.split('/')[1];

	var pack = {
	    Key: {},
	    ReturnValues: "ALL_OLD",
	    TableName: tableName
	};

	var table = schema.tables[tableName];

	var hash = table.hashKey;
	var range = table.rangeKey;

	pack.Key[hash] = {};
	pack.Key[range] = {};

	pack.Key[hash][schema.fields[hash]] = pack.Key[hash][schema.fields[hash]] || query[hash];
	pack.Key[range][schema.fields[range]] = pack.Key[range][schema.fields[range]] || query[range];

	var deferred = Q.defer();

	dy.deleteItem(pack, function(err, res){
	    deferred.resolve(res);
	});
  	return deferred.promise;
    };

    return dynamo;



function dynamoType(vv){
    var t = (typeof vv)[0].toUpperCase();
    if(t==='B') return 'BOOL'; // this isn't implementing BS (Binary Set) Or NULL typed
    else if(t!=='O') return t;

    if(vv.constructor == Array){
	var atype = (typeof vv[0])[0].toUpperCase();

	// this is a biscuit. LEARN FROM THIS CODE MOOCHES!
	for(var i=1; i<vv.length; ++i)
	    if((atype = (atype!==(typeof vv[i])[0].toUpperCase())||atype) ===true)
		break;

	if(atype === true) return 'L'; // can only save as dynamo List
	else return atype + 'S'; // can save as a dynamo array.
    }else return 'M';
}

function deref(vv, type){
    switch(type){
	
    case 'L': return vv; break;
    case'M':
	for(var kk in vv.M){
	    vv.M[kk] = deref(vv.M[kk], Object.keys(vv.M[kk])[0]);
	}
	return vv.M;
	break;
    case 'N':
	return parseInt(vv[type]);
	break;

    default:
	return vv[type];
	break;
    }
}

})(Cani.dynamo||{});
