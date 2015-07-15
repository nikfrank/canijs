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
	dy = new AWS.DynamoDB(conf.dynamo.awsConfigPack);

	dy.listTables(function(err, data){
	    if(err){
		// maybe parse the meaningless aws error messages?
		console.log(err);
	    }

	    dynamo.tables = data.TableNames;
	    Cani.core.affirm('dynamo', dynamo);

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

	var tableName = schema.table.split('/')[1]; // MIGHT FUCK UP

	for(var ff in query){
	    if(query[ff] === '') continue; //  no blank strings allowed
	    if(query[ff] === null) continue; // typeof null == 'object'

	    if(ff[0] === '$') continue; // don't write angular fields. also fuck php?

	    if(ff in schema.fields){
		// if in schema write to pack with type
		pack[ff] = {};

		if(pack[ff][schema.fields[ff]] === 'N') query[ff] = ''+query[ff];

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

	var deferred = Q.defer(); // deferred.reject to do an error

	if(!options) options = {};
	if(!query) query = {};
// maybe put something in here to kill requests before booting is done
// put option for "all possible tables? to load from all tables possible

// loop through query, if string or number, leave. if object -> unpack conditions and values

	var indexName;
	var tableName;

	var schema = schemas[schemaName];

	// right away supplement the query with the schema defaults if proper

	var pack = {};

	if(options.index) indexName = options.index;
	if(options.table) tableName = options.table;

	var tablesTC = schema.tables;
	if(tableName){
	    tablesTC = {};
	    tablesTC[tableName] = schema.tables[tableName];
	}

	// filter the tables to check based on the options. still run loop to check indices
	// filter the tables based on what is available
	for(var tt in tablesTC) if(dynamo.tables.indexOf(tt) === -1) delete tablesTC[tt];

	// if options.table isn't permitted throw a nicely worded message about permissions by IAMRoles, confirmations

	// fill in default fields from schema
	for(var ff in schema.defaults){
	    if(typeof schema.defaults[ff] === 'string'){
		if(typeof query[ff] === 'undefined') query[ff] = schema.defaults[ff];
	    }else if(typeof schema.defaults[ff] === 'object'){
		for(var mod in schema.defaults[ff]){
		    if(typeof query[ff] === 'undefined') query[ff] = Cani[mod].write(schema.defaults[ff][mod]);
		}
	    }
	}

	// here we may have many tables and no indication which to use.
	// pick the first one who has an index we can use
	// quit if we find one with range and hash
	
	var ctable;
	var cindex;

// if(options.allTables) keep track of all possible queries, then make all of them
	// this finds a table-index pair we can use.
//make sure we have hash+range for index query
	for(var table in tablesTC){
	    if(indexName){
		//check that this table has that index. if it does break
		if(indexName === 'default'){
		    // check that we have the hash key... if we don't we can still check other tables
		    if((typeof query[tablesTC[table].hashKey] !== 'undefined')&&(typeof query[tablesTC[table].rangeKey] !== 'undefined')){
			ctable = table;
			cindex = 'default';
			break;
		    }else if(typeof query[tablesTC[table].hashKey] !== 'undefined'){
			ctable = table;
			cindex = 'default';
		    }
		}else if(tablesTC[table].indices.indexOf(indexName) > -1){
		    // check that we have the hash key... if we don't, throw an error right away
		    var hashKey = indexName.split('-')[0];
		    var rangeKey = indexName.split('-')[1];
		    if((typeof query[hashKey] !== 'undefined')&&(typeof query[rangeKey] !== 'undefined')){
			ctable = table;
			cindex = indexName;
			break;
		    }// need both for an index
		}
		// the index is in another table. if this is the last one it'll throw an error after the loop
		continue;
	    }else{
		// check this table's default index
		if((typeof query[tablesTC[table].hashKey] !== 'undefined')&&(typeof query[tablesTC[table].rangeKey] !== 'undefined')){
		    ctable = table;
		    cindex = 'default';
		    break;
		}else if(typeof query[tablesTC[table].hashKey] !== 'undefined'){
		    ctable = table;
		    cindex = 'default';
		}

		// check the other indices
		var pind = tablesTC[table].indices;

		for(var i=0; i<pind.length; ++i){
		    var hashKey = pind[i].split('-')[0];
		    var rangeKey = pind[i].split('-')[1];

		    if((typeof query[hashKey] !== 'undefined')&&(typeof query[rangeKey] !== 'undefined')){
			ctable = table;
			cindex = pind[i];
			break;
		    }// need both for non-default index
		}
	    }
	}
	
	if((typeof ctable === 'undefined')||(typeof cindex === 'undefined')){
	    // if we don't have a table or index here, throw a reasonably worded error
	    // message (tell them to check the config file or the dynamo.load call)
// use a scan instead
	    console.log('couldnt determine table to load dynamos from. check the dynamo.load call and the config file');
	}
	// that shit is ugly like a penguin's anus at feeding time!

	pack.TableName = tableName = ctable;
	if(cindex !== 'default') pack.IndexName = indexName = cindex;

	var table = schema.tables[ctable];

	// here we know that there is a table and index which we can use properly.
	// fill the KeyConditions with values from query index (which has been supplemented by the schema defaults)
	pack.KeyConditions = {};

	for(var ff in query){
	    // this will let you override default with empty

	    var type = (typeof query[ff])[0].toUpperCase();

// querying arrays

	    if(ff in schema.fields) type = schema.fields[ff];
	    if(['S','N'].indexOf(type) === -1) continue;

	    var subpack = {}
	    subpack[type] = query[ff];
// write ONLY hash or range here (both req for index other than default)
// pull operators here?
	    if(query[ff] !== '') pack.KeyConditions[ff] = {"ComparisonOperator": "EQ", "AttributeValueList": [subpack] };
	}

	dy.query(pack, function(err, res){
	    //defer promise
	    if(err){
		console.log(err);
		deferred.reject(err);
	    }

	    //unpack the response
	    var pon = [];

	    for(var i=0; i<res.Items.length; ++i){

		var itm = {};
		for(var ff in res.Items[i]){
		    itm[ff] = res.Items[i][ff][Object.keys(res.Items[i][ff])[0]];
		}
		if(typeof itm.__DESTRINGS !== 'undefined'){
		    for(var j=0; j<itm.__DESTRINGS.length; ++j){
			itm[itm.__DESTRINGS[j]] = JSON.parse(itm[itm.__DESTRINGS[j]]);
		    }
		    delete itm.__DESTRINGS;
		}
		pon.push(itm);
	    }
	    deferred.resolve(pon);
	});
  	return deferred.promise;
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
