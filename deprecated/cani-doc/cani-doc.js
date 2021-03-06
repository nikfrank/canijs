Cani.doc = (function(doc){
    // expect schemas in conf.doc to map saves/loads, set indices, confirm permissions properly

    var schemas = [];
    doc.schemas = schemas;

    var tables = [];
    doc.tables = tables;

    var dy; // aws dyanmo singleton

    // ------------------------------- config -------------------------------------
    var DYCONF = function(conf, provider){ //provider =<= ['fb', 'google', ('aws')]

	schemas = conf.doc.schemas;

	if(provider === 'noauth') return;

	var webCredPack = {
	    RoleArn: conf.doc.IAMRoles[provider],    //conf[provider].IAMRoles['db.dy'],
	    WebIdentityToken: Cani.user[provider].accessToken //check this for no auth setup
	};

	if(provider === 'fb') webCredPack.ProviderId = 'graph.facebook.com';
	AWS.config.credentials = new AWS.WebIdentityCredentials(webCredPack);

// there's a bug sometimes which I think is caused by facebook token failure, but proof is elusive!
console.log('AWS.conf.cred',AWS.config.credentials);
console.log('webcredpack',webCredPack);
console.log(Cani.user);
	
	dy = new AWS.DynamoDB(conf.doc.awsConfigPack);
	dy.listTables(function(err, data) {
	    if(err){
		// maybe parse the meaningless aws error messages?
		console.log(err);
		console.log(Cani.user[provider]);
	    }

	    doc.tables = data.TableNames;


	    // finally done booting dynamo
	    Cani.core.affirm('dy', doc);

	    // affirm dy.table foreach table
	    for(var i=0; i<doc.tables.length; ++i) Cani.core.affirm('dy.'+doc.tables[i], doc);

	});
    };

    // dynamo boot hook
    Cani.core.on('config: doc noauth', function(conf){
	DYCONF(conf, 'noauth');
	Cani.core.confirm('fb').then(function(user){ DYCONF(conf, 'fb');} );
	Cani.core.confirm('google').then(function(user){ DYCONF(conf, 'google');} );
    } );

    // expose save and load functions

//------------------------------------------------------------------------------------------
    doc.write = function(type){
	// in cases where default options are non-EQ queries
	return '';
    };

//------------------------------------------------------------------------------------------
    doc.save = function(schemaName, query, options){
	if(typeof query === 'undefined') query = {};

	var deferred = Q.defer(); // deferred.reject to do an error

	var schema = schemas[schemaName];

	// xor defaults into the query
	for(var ff in schema.saveDefaults){
	    if(typeof schema.saveDefaults[ff] === 'string'){
		if(typeof query[ff] === 'undefined') query[ff] = schema.saveDefaults[ff];
	    }else if(typeof schema.saveDefaults[ff] === 'object'){
		for(var mod in schema.saveDefaults[ff]){
		    if(typeof query[ff] === 'undefined') query[ff] = Cani[mod].write(schema.saveDefaults[ff][mod]);
		}
	    }
	}
	
	// load the query into an AWS Item pack
	var pack = {};
	var destrings = []; // array to hold params which will be stringified in storage

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

		if(type === 'N') query[ff] = ''+query[ff];

		//if it's an object, we may have to stringify it.
		if(type === 'O'){
		    //determine if is all same (S, N), if not stringify. (option for BS?)
		    var stringit = options.stringifyAllArrays || schema.stringifyAllArrays || (type === 'B'); // always stringify booleans
		    if(query[ff].constructor == Array){
			var atype = (typeof query[ff][0])[0].toUpperCase();

			// this is a biscuit. LEARN FROM THIS CODE MOOCHES!
			for(var i=1; (i<query[ff].length)&&(!stringit); ++i)
			    if(stringit |= (atype !== (typeof query[ff][i])[0].toUpperCase()))	break;

			if(!stringit) type = atype + 'S'; // can save as a dynamo array.
		    }

		    if((query[ff].constructor == Object)||(stringit)){
			// if object or mixed array, stringify
			type = 'S';
			query[ff] = JSON.stringify(query[ff]);
			// add to list of things to destringify later
			destrings.push(ff);
		    }
		}

		pack[ff][type] = query[ff];
	    }
	}
	if(JSON.stringify(destrings).length > 4) pack['__DESTRINGS'] = {'SS':destrings};

	//find a table we have the hash and range key for to save to (check options.table first)
	var tableName = '';
	if(options.table) tableName = options.table;

	var tablesTC = schema.tables;
	if(tableName){
	    tablesTC = {};
	    tablesTC[tableName] = schema.tables[tableName];
	}

	// filter the tables to check based on the options. still run loop to check indices
	// filter the tables based on what is available
	for(var tt in tablesTC) if(doc.tables.indexOf(tt) === -1) delete tablesTC[tt];

// loop through the tables, find one that we have the hash and range key for.
	for(var table in tablesTC){
	    var hash = schema.tables[table].hashKey;
	    var range = schema.tables[table].rangeKey;

	    if((typeof query[hash] === 'undefined')||(typeof query[range] === 'undefined')) delete tablesTC[table];
	}

	var nt = 0;
	for(var tt in tablesTC) nt++;
	
	if(nt === 1) for(var tt in tablesTC) tableName = tt;

	if(!tableName){
	    deferred.reject('must indicate table for save');
	}else if(!(tableName in tablesTC)){
	    //throw error?
	    if(tableName in schema.tables) deferred.reject('missing hash/range for indicated table');
	    else deferred.reject('asset dynamo table: '+tableName+' not available/permitted');
	}else{
	    // were done here

	    dy.putItem({TableName:tableName, Item:pack}, function(err, res){
		if(err){
		    console.log(err);
		    // parse aws error msg
		    deferred.reject(err);
		}
		deferred.resolve(query);
	    });
	}
	return deferred.promise;
    };

//------------------------------------------------------------------------------------------
    doc.load = function(schemaName, query, options){

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
	for(var tt in tablesTC) if(doc.tables.indexOf(tt) === -1) delete tablesTC[tt];

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
	    // message (tell them to check the config file or the doc.load call)
// use a scan instead
	    console.log('couldnt determine table to load docs from. check the doc.load call and the config file');
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
    doc.erase = function(schemaName, query, options){
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

    return doc;

})(Cani.doc||{});
