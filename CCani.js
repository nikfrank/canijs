var googleSigninCallback;

var copy = function(r){return JSON.parse(JSON.stringify(r));};

if(typeof window['Q'] === 'undefined'){
    if(typeof window['angular'] === 'undefined'){
	alert('Im crashing because I dont have q');
	window.crashbecauseQ = true;
    }else{
	window['Q'] = window['angular'].injector(['ng']).get('$q');
	console.log(Q);
    }
}

var Cani = Cani || {};

Cani.core = (function(core){
    // core is just notifications and confirmations
    
    var config = {};
    core.config = config;

    var note = {};//notifications

    core.cast = function(asset, flush, params){
	if(typeof asset === 'string'){
	    if(typeof note[asset] === 'undefined') return;
	    for(var i=0; i<note[asset].length; ++i) note[asset][i](params);
	    if(flush) note[asset] = [];
	}else if(asset instanceof RegExp){
	    for(var ff in note){
		if(asset.test(ff)){
		    for(var i=0; i<note[ff].length; ++i) note[ff][i](params);
		    if(flush) note[ff] = [];
		}
	    }
	}
    };

    core.on = function(asset, tino){
	if(typeof note[asset] === 'undefined') note[asset] = [];
	note[asset].push(tino);
	// in order to achieve multi-asset casting, use the affirmation system
	// ie, when something loads, affirm. to wait on something, confirm
    };

    var assets = {};
    core.assets = assets;

    core.confirm = function(asset){
	var deferred = Q.defer();

	if(typeof asset === 'string'){
	    if(asset in assets){
		deferred.resolve(assets[asset]);
	    }else{
		// register note for confirmation
		if(typeof note['confirm: '+asset] === 'undefined'){
		    note['confirm: '+asset] = [];
		}
		core.on('confirm: '+asset, function(){
		    deferred.resolve(assets[asset]);
		});
	    }
  	    return deferred.promise;

	}else if(typeof asset === 'object'){
	    // check that all of the assets are present, return as collection

	    // cheeky way to do this is to find the first missing asset
	    //    then on it's load register the same confirm
	    // if everything is here send it all back
	    // technically this would work for arrays of arrays of assets. WoAh.
	    var everything = true;
	    for(var se in asset){
		var s = (asset.constructor == Array)? asset[se] : se;
		if(!(s in assets)){
		    everything = false;
		    core.confirm(s).then(function(singleAsset){
			core.confirm(asset).then(function(allAssets){
			    deferred.resolve(allAssets);
			});
		    });
		    break;
		}
	    }
	    if(everything){
		var ret = {};
		for(var se in asset){
		    var s = (asset.constructor == Array)? asset[se] : se;
		    ret[s] = assets[s];
		}
		deferred.resolve(ret);
	    }
	    return deferred.promise;
	}
    };

    core.affirm = function(asset, module){
	if(!(asset in assets)) assets[asset] = module;
	core.cast('confirm: '+asset, true);
    };

    core.defirm = function(asset, params){
	if(assets.indexOf(asset)>-1) delete assets[asset];
	core.cast('defirm: '+asset, true, params);
    };



    core.boot = function(conf){
	// any config requiring something else to register on that thing's cast

	// also, if the config file were to determine boot, this would be the place to read that

	config = conf;
	return core.cast(/config/, true, conf);
    };

    return core;

})(Cani.core||{});

Cani.user = (function(user){
    // store user information
    // auth on request

    Cani.core.on('config: user.noauth', function(conf){

	user.noauth = conf.user.noauth;
    });

    Cani.core.on('config: user.fb', function(conf){
	//------------------------------FACEBOOK AUTH---------------------------------
	// this requires a fb:login button in the markup
	if(typeof conf.user.fb !== 'undefined') if(typeof conf.user.fb.App !== 'undefined'){
	    window.fbAsyncInit = function() {
		FB.init({
		    appId      : conf.user.fb.App,
		    status     : true, // check login status
		    cookie     : true, // enable cookies to allow the server to access the session
		    xfbml      : true  // parse XFBML
		});

		// facebook has a way to request extra permissions that should be a config option
		FB.Event.subscribe('auth.authResponseChange', function(response) {
		    if(response.status === 'connected'){
			// record the facebook auth data, run dbconfig with it
			user.fb = response.authResponse;
			
			// grab the facebook profile
			FB.api('/me', function(pon) {
			    user.fb.profile = pon;
			    //Cani.core.cast('fb', true, conf);
			    Cani.core.affirm('fb', user);
			});

		    } else if (response.status === 'not_authorized') {
			//user hasnt authed the app, requests them to do so
			FB.login();
		    } else {
			//FB.login();
			alert('logged out');
			location.reload();
		    }
		});
	    };

	    // Load the SDK asynchronously
	    (function(d){
		var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement('script'); js.id = id; js.async = true;
		js.src = "//connect.facebook.net/en_US/all.js";
		ref.parentNode.insertBefore(js, ref);
	    }(document));
	}
    });

    Cani.core.on('config: user.google', function(conf){
	//-------------------------------GOOGLE AUTH--------------------------------
	// this requires some meta tags in the markup, also a #gSigninWrapper for the button
	if(typeof conf.user.google !== 'undefined') if(typeof conf.user.google.App !== 'undefined'){

	    var po = document.createElement('script');
	    po.type = 'text/javascript'; po.async = true;
	    po.src = 'https://apis.google.com/js/client:plusone.js?onload=render';
	    var s = document.getElementsByTagName('script')[0];
	    s.parentNode.insertBefore(po, s);

	    googleSigninCallback = function(authResult) {
		if (authResult['status']['signed_in']) {
		    // Update the app to reflect a signed in user
		    // Hide the sign-in button now that the user is authorized, for example:

		    document.getElementById('gSigninWrapper').setAttribute('style', 'display: none');

		    // record the google auth data, run dbconfig with it.
		    user.google = authResult;

		    user.google.accessToken = authResult.id_token;
		    // naming consistency... don't be fooled by the "access_token" field. he does nothing
		    //dbconfig('google');

		    // grab the google profile
		    gapi.client.load('plus','v1', function(){
			var request = gapi.client.plus.people.get({
			    'userId': 'me'
			});
			request.execute(function(resp) {
			    user.google.profile = resp;
			    //Cani.core.cast('google', true, conf);
			    Cani.affirm('google', user);
			});
		    });

		} else {
		    console.log('Sign-in state: ' + authResult['error']);
		}
	    };


	    setTimeout(function(){
		var additionalParams = {
		    'callback': googleSigninCallback
		};

		// Attach a click listener to a button to trigger the flow.
		var signinButton = document.getElementById('signinButton');

		if(document.getElementById('gSigninWrapper'))
		    document.getElementById('gSigninWrapper').setAttribute('style', 'display: block');

		if(signinButton) signinButton.addEventListener('click', function() {
		    gapi.auth.signIn(additionalParams); // Will use page level configuration
		});
	    },300);
	}
    });


    // expose schema writers and parsers

    user.write = function(type){
	// return just the value. the database handler will package it
	if(type === 'id'){
	    return ('fb||'+user.fb.profile.id);
	}else if(type === 'id+date'){
	    return ('fb||'+user.fb.profile.id+'##'+(new Date()).getTime());
	}
    };

    user.parse = function(type, val){
	// using the type, split the val data into reasonable parts
    };

    return user;

})(Cani.user||{});

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
    doc.save = function(schemaName, query, options){

	var schema = schemas[schemaName];
console.log(schemaName, ' ', schemas);
	// xor defaults into the query
	for(var ff in schema.saveDefaults){
	    if(typeof schema.saveDefaults[ff] === 'string'){
		if(typeof query[ff] === 'undefined') query[ff] = schema.defaults[ff];
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
		pack[ff][schema.fields[ff]] = query[ff];
	    }else{
		// do the old style type guessing
		var type = (typeof query[ff])[0].toUpperCase();
		if(type === 'U') continue; // shouldn't happen though
		    
		pack[ff] = {};

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

	    if((typeof query[hash] === 'undefined')||(typeof query[range] === 'undefined')) delete tablesTC[tt];
	}

	// make request and return promise
	var deferred = Q.defer();

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
		}
		deferred.resolve(res);
	    });
	}
	return deferred.promise;
    };

//------------------------------------------------------------------------------------------
    doc.load = function(schemaName, query, options){
	console.log(schemaName, query, options);
	if(!options) options = {};
	if(!query) query = {};
// maybe put something in here to kill requests before booting is done
// put option for "all possible queries? to load from all tables possible

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
		    }else if(typeof query[tablesTC[table]].hashKey !== 'undefined'){
			ctable = table;
			cindex = indexName;
		    }
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
		    }else if(typeof query[hashKey] !== 'undefined'){
			ctable = table;
			cindex = pind[i];
		    }
		}
	    }
	}
	
	if((typeof ctable === 'undefined')||(typeof cindex === 'undefined')){
	    // if we don't have a table or index here, throw a reasonably worded error
	    // message (tell them to check the config file or the doc.load call)
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

// also, look in options for different operators?

	    if(ff in schema.fields) type = schema.fields[ff];
	    if(['S','N'].indexOf(type) === -1) continue;

	    var subpack = {}
	    subpack[type] = query[ff];

	    if(query[ff] !== '') pack.KeyConditions[ff] = {"ComparisonOperator": "EQ", "AttributeValueList": [subpack] }
	}

	// keyconditions has to include at least the hash key (which we know we have)
	// if present it will also include the range key

	var deferred = Q.defer();

	dy.query(pack, function(err, res){
	    //defer promise
	    if(err) console.log(err);
	    else console.log('good query');

	    //unpack the response
	    var pon = [];

	    for(var i=0; i<res.Items.length; ++i){

		var itm = {};
		for(var ff in res.Items[i]){
		    itm[ff] = res.Items[i][ff][Object.keys(res.Items[i][ff])[0]];
		}
		if(typeof itm.__DESTRINGS !== 'undefined'){
		    // parse the listed items in place
		}
		pon.push(itm);
	    }
	    deferred.resolve(pon);
	});
  	return deferred.promise;
    };

    return doc;

})(Cani.doc||{});

Cani.file = (function(file){
    // expect schemas in conf.file to map saves/loads, confirm permissions properly

    var s3; // aws s3 singleton

    // run this right away with noauth
    // then on the provider casts run 

    var S3CONF = function(conf, provider){

	s3 = new AWS.S3({params: {Bucket: conf.file.schemas['default'] } });
	s3.Bucket = conf.file.schemas['default'];
	
	var bucketCredPack = {
            RoleArn: conf.file.IAMRoles[provider],
            WebIdentityToken: Cani.user[provider].accessToken
        };
	if(provider === 'fb') bucketCredPack.ProviderId = 'graph.facebook.com';
	s3.config.credentials = new AWS.WebIdentityCredentials(bucketCredPack);

	// is there a list available buckets function? idk
	Cani.core.cast('s3', true);
    };

    Cani.core.on('config: file noauth', function(conf){ S3CONF(conf, 'noauth');} );
    Cani.core.on('fb', function(conf){ S3CONF(conf, 'fb');} );
    Cani.core.on('google', function(conf){ S3CONF(conf, 'google');} );


    // expose save and load functions

    return file;

})(Cani.file||{});

try{
//-----data-dy module
    cc.save.doc = function(query,data){
	// this is for db.dy only

	//query = {overwrite:bool, docType:string}

	//here check the format of the data, can be:

	// [{key:'', value:..(,type:'')}...] implemented
	// {key1:value1, ...} implemented

	// query.overwrite if true: use old docId, if false: make new docId

	var pack = {};
	var destrings = [];

	if(data.constructor == Object){
	    for(var it in data){
		if(data[it] === '') continue;

		// dynamodb doesn't allow empty strings
		pack[it] = {};

		var type = (typeof data[it])[0].toUpperCase();
		//if it's an object, we have to stringify it. ugh.
		if(type === 'U') type = 'S';
		if(type === 'O'){
		    // determine the subtype if is qualify, append S to that letter
		    // if array, determin if is all same (S, N), if not stringify

		    // if object or mixed array, stringify
		    data[it] = JSON.stringify(data[it]);
		    // add to list of things to destringify later
		    destrings.push(it);
		}
		pack[it][type] = data[it];
	    }
	    if(JSON.stringify(destrings).length > 4) pack['__DESTRINGS'] = {'SS':destrings};
	}

	if(data.constructor == Array){
	    for(var it in data){
		if(data[it].val === '') continue;
		if(typeof data[it].val === 'undefined') continue;
		// dynamodb doesn't allow empty strings

		pack[data[it].key] = {};
		if(typeof data[it].type === 'undefined') {

		    data[it].type = (typeof data[it].val)[0].toUpperCase();
		    //if it's an object, we have to stringify it. ugh.
		    if(data[it].type === 'U') data[it].type = 'S';
		    if(data[it].type === 'O'){
			// determine the subtype if is qualify, append S to that letter

			// if array, determin if is all same (S, N), if not stringify

			// if object or mixed array, stringify
			data[it].val = JSON.stringify(data[it].val);
			// add to list of things to destringify later
			destrings.push(it);
		    }
		}
		pack[data[it].key][data[it].type] = data[it].val;
	    }
	    if(JSON.stringify(destrings).length > 4) pack['__DESTRINGS'] = {'SS':destrings};
	}

	var tableName = '';

	pack.docType = {'S':query.docType};

	// set the ownership based on the auth order, choose the table to write to
	pack.owner = {'S':''};
	for(var authTypeNum in cc.authOrder){
	    var authType = cc.authOrder[authTypeNum];
	    if(typeof user[authType] !== 'undefined'){
		pack.owner = {'S':authType+'||'+user[authType].profile.id};//lucky thats the same already

		if(typeof user[authType].tables !== 'undefined'){
		    if(typeof user[authType].tables.dy !== 'undefined'){
			if(user[authType].tables.dy.length === 1){
			    tableName = user[authType].tables.dy[0];
			}else{
			    if(query.privacy === true) tableName = 'private';
			    else tableName = 'docs';
			    // obviously this makes some assumptions which should be documented
			}
		    }
		}
		break;
	    }
	}

	if(!query.overwrite || (typeof pack.docId === 'undefined')){
	    pack.docId = {'S':pack.owner.S + '##' + (new Date()).getTime()};
	}
	
	if(tableName.length<3){
	    console.log(user)
	    console.log('write failed, tables not yet loaded');
	    return;
	}

	var deferred = Q.defer();

	db.dy.putItem({TableName:tableName, Item:pack}, function(err, res){
	    if(err) console.log(err);
	    console.log(res);

	    deferred.resolve(res);
	});

	return deferred.promise;
    };

//-----------------load
    cc.load.doc = function(query, index){
	// this is for loading db.dy docs
	//pack up and make a query call

	var tableName = '';
	var owner = '';

	for(var authTypeNum in cc.authOrder){
	    var authType = cc.authOrder[authTypeNum];
	    if(typeof user[authType] !== 'undefined'){
		owner = {'S':authType+'||'+user[authType].profile.id};//lucky thats the same already

		if(typeof user[authType].tables !== 'undefined') {
		    if(typeof user[authType].tables.dy !== 'undefined') {
			if(user[authType].tables.dy.length !== 0){
			    if(query.privacy === true){
				tableName = 'private';
			    }else{
				tableName = 'docs';//user[authType].tables.dy[0];
			    }
			}
		    }
		}
		break;
	    }
	}

	if(query.privacy === true){
	    pack = {IndexName:"owner-docType-index",
		    TableName:tableName,
		    KeyConditions:{"docType": {"ComparisonOperator": "EQ", "AttributeValueList": [{"S":"lesson"}]}
				  }
		   };
	}else{
	    pack = {IndexName:"docType-owner-index",
		    TableName:tableName,
		    KeyConditions:{"docType": {"ComparisonOperator": "EQ", "AttributeValueList": [{"S":"lesson"}]}
				  }
		   };
	}

	if(query.mine || query.privacy){
	    pack.KeyConditions.owner = {"ComparisonOperator": "EQ", "AttributeValueList":[owner]};
	}

	var deferred = Q.defer();

	db.dy.query(pack, function(err, res){
	    //defer promise
	    if(err) console.log(err);
	    else console.log('good query');

	    //unpack the response
	    var pon = [];

	    for(var i=0; i<res.Items.length; ++i){

		var itm = {};
		for(var ff in res.Items[i]){
		    itm[ff] = res.Items[i][ff][Object.keys(res.Items[i][ff])[0]];
		}
		if(typeof itm.__DESTRINGS !== 'undefined'){
		    // parse the listed items in place
		}
		pon.push(itm);
	    }
	    deferred.resolve(pon);
	});
  	return deferred.promise;
    };
//-------------end data-dy module

//------------data-s3 module
    cc.save.file = function(query,file){
	// this is for db.s3 only

	var objKey = 'fb||' + user.fb.profile.id + '/' + file.name;
	if(query === 'F'){
            var params = {Key: objKey, ContentType: file.type, Body: file, ACL: 'public-read'};
	}else if(query === 'S'){
	    var params = {Key: objKey, ContentType: 'text/plain', Body: file, ACL: 'public-read'};
	}

        db.s3.putObject(params, function (err, data) {
            if (err) {
		console.log('err');
                console.log(err);
            } else {
		console.log(data);
            }

        });

    };

    cc.load.fileList = function(query, index){
	// load the file list from the bucket
	db.s3.listObjects({Bucket:db.s3.Bucket}, function(err, res){
	    console.log(res);
	});
    };

    cc.load.file = function(query, index){
	// this is for loading s3 files without db.dy indices... Key is the name of the file(?)
	db.s3.getObject({Bucket:db.s3.Bucket, Key:index}, function(err, res){
	    console.log(res);
	});
    };
//-------------end data-s3 module


}catch(e){

console.log(e);

}
