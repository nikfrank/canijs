if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

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
    };

    // dynamo boot hook
    Cani.core.on('config: dynamo', DYCONF);

    dynamo.init = function(){
	dy = new AWS.DynamoDB(dyconf.dynamo.awsConfigPack);

	dy.listTables(function(err, data){
	    if(err){
		// maybe parse the meaningless aws error messages?
		console.log(err);
	    }

	    dynamo.tables = data.TableNames;
	    Cani.core.affirm('dynamo', dynamo);

console.log('dytables', dynamo.tables);
	    // affirm dy.table foreach table
	    for(var i=dynamo.tables.length; i-->0;) Cani.core.affirm('dynamo.'+dynamo.tables[i], dynamo);

	});
    }


    // expose save and load functions

//------------------------------------------------------------------------------------------
    dynamo.write = function(type){
	// in cases where default options are non-EQ queries
	return '';
    };

//------------------------------------------------------------------------------------------
    dynamo.save = function(schemaName, query, options){

	if(typeof query === 'undefined') query = {};

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
		var type = (typeof query[ff])[0].toUpperCase();
		if(type === 'U') continue; // shouldn't happen though
		    
		pack[ff] = {};

		if(type === 'N') query[ff] = ''+query[ff]; // pass numbers as strings? psh

		if(type === 'O'){
		    // M for map === {}, L for list === []
		    if(query[ff].constructor == Array){
			var atype = (typeof query[ff][0])[0].toUpperCase();

			// this is a biscuit. LEARN FROM THIS CODE MOOCHES!
			for(var i=1; i<query[ff].length; ++i)
			    if((atype = (atype !== (typeof query[ff][i])[0].toUpperCase()))===true) break;

			if(atype === true) type = 'L'; // can only save as dynamo List
			else type = atype + 'S'; // can save as a dynamo array.
		    }else if(query[ff].constructor == Object) type = 'M';
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

	var schema = schemas[schemaName];

	var table = schema.table;
	var tableName = table.arn.split('/')[1];

	var indexName;
	if(indexName = options.index)
	    if(table.indices.indexOf(indexName) === -1)
		throw 'index '+indexName+' not available';

	if(dynamo.tables.indexOf(tableName) === -1) throw 'table '+tableName+' not available';
	
	// that shit is ugly like a penguin's anus at feeding time!

	var pack = {};

	pack.TableName = tableName;
	// pack.IndexName left empty for default?

	// string build a KeyConditionExpression
	if(!(table.hashKey in query)) throw 'needs a hashkey ('+table.hashKey+') expression';
	pack.KeyConditionExpression = table.hashKey + ' = :'+table.hashKey;

	pack.ExpressionAttributeValues = {};
	pack.ExpressionAttributeValues[':'+table.hashKey] = {};
	pack.ExpressionAttributeValues[':'+table.hashKey][(typeof query[table.hashKey])[0].toUpperCase()] = 
	    ''+query[table.hashKey];

	for(var ff in query){
	    if(ff === table.hashKey) continue;
	    var type = (typeof query[ff])[0].toUpperCase();
	    var cOp = '=';

// querying arrays? later
	    if((type === 'O') && ('is an actual comparison operator query')){
		cOp = Object.keys(query[ff])[0];
		type = (typeof query[ff][cOp])[0].toUpperCase();
		query[ff] = query[ff][cOp];

	    }else if(['S','N'].indexOf(type) === -1) continue;

	    var expr;
	    if(cOp !== 'begins_with') expr = ff+' '+cOp+' :'+ff;
	    else expr = 'begins_with('+ff+', :'+ff+')';

	    pack.ExpressionAttributeValues[':'+ff] = {};
	    pack.ExpressionAttributeValues[':'+ff][type] = ''+query[ff];

	    if(query[ff] !== '')
		pack.KeyConditionExpression += ' and '+expr;
	}

console.log(pack.KeyConditionExpression, pack);
	dy.query(pack, function(err, res){
	    //defer promise
	    if(err){
		console.log(err);
		def.reject(err);
	    }
console.log(res);
	    //unpack the response
	    var pon = [];

	    for(var i=0; i<res.Items.length; ++i){
		var itm = {};
		for(var ff in res.Items[i])
		    itm[ff] = res.Items[i][ff][Object.keys(res.Items[i][ff])[0]];
		pon.push(itm);
	    }
	    def.resolve(pon);
	});
  	return def.promise;
    };

//------------------------------------------------------------------------------------------
    dynamo.erase = function(schemaName, query, options){
	// make a deleteItem request to the table determined by options &| schema

	// basically I'm going to require that you have the tableName, hash and range.
	// feel free to send me a collection of hash-range (maybe batch delete later)

// autofill table for schemas with only one table
	var tableName  = options.table;

	var pack = {
	    Key: {},
	    ReturnValues: "ALL_OLD",
	    TableName: tableName
	};

	var schema = schemas[schemaName];
	var table = schema.tables[tableName];

	var hash = table.hashKey;
	var range = table.rangeKey;

	pack.Key[hash] = {};
	pack.Key[range] = {};

	//if((options.useDefault.indexOf(hash) === -1)||(typeof options.useDefault === 'string')){
// fill marked defaults
	//}

	pack.Key[hash][schema.fields[hash]] = pack.Key[hash][schema.fields[hash]] || query[hash];
	pack.Key[range][schema.fields[range]] = pack.Key[range][schema.fields[range]] || query[range];

	var deferred = Q.defer();

	dy.deleteItem(pack, function(err, res){
	    deferred.resolve(res);
	});
  	return deferred.promise;
    };

    return dynamo;

})(Cani.dynamo||{});
