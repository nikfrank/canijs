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
		if(asset.test(ff)) for(var i=0; i<note[ff].length; ++i) note[ff][i](params);
		if(flush) note[ff] = [];
	    }
	}
    };

    core.on = function(asset, tino){
	if(typeof note[asset] === 'undefined') note[asset] = [];
	note[asset].push(tino);
    };

    var assets = [];
    core.assets = assets;

    core.confirm = function(asset){
	var deferred = Q.defer();

	if(assets.indexOf(asset)>-1){
	    deferred.resolve();
	}else{
	    // register note for confirmation
	    if(typeof note['confirm: '+asset] === 'undefined') note['confirm: '+asset] = [];
	    note['confirm: '+asset].push(function(){ deferred.resolve();});
	}

  	return deferred.promise;
    };

    core.affirm = function(asset){
	if(assets.indexOf(asset)===-1) assets.push(asset);
	core.cast('confirm: '+asset, true);
    };

    core.defirm = function(asset){
	if(assets.indexOf(asset)>-1) assets.splice(assets.indexOf(asset), 1);
    };



    core.boot = function(conf){
	// any config requiring something else to register on that thing's cast

	// also, if the config file were to determine boot, this would be the place to read that

	config = conf;
	return core.cast(/config/, true, conf);
    };

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
			    Cani.core.cast('fb', true, conf);
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

		    user.google.accessToken = authResult.id_token;// naming consistency... don't be fooled by the "access_token" field. he does nothing
		    //dbconfig('google');

		    // grab the google profile
		    gapi.client.load('plus','v1', function(){
			var request = gapi.client.plus.people.get({
			    'userId': 'me'
			});
			request.execute(function(resp) {
			    user.google.profile = resp;
			    Cani.core.cast('google', true, conf);
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
	// return {'S':'fb||192865412235'} or whatever
    };

    user.parse = function(type, val){
	// using the type, split the val data into reasonable parts
    };

})(Cani.user||{});

Cani.doc = (function(doc){
    // expect schemas in conf.doc to map saves/loads, set indices, confirm permissions properly

    var tables = [];
    doc.tables = tables;

    var dy; // aws dyanmo singleton

    // run this right away with noauth
    // then on the provider casts run 

    var DYCONF = function(conf, provider){ //provider =<= ['fb', 'google', ('aws')]

	var webCredPack = {
	    RoleArn: conf.doc.IAMRoles[provider]    //conf[provider].IAMRoles['db.dy'],
	    WebIdentityToken: Cani.user[provider].accessToken //check this for no auth setup
	};

	if(provider === 'fb') webCredPack.ProviderId = 'graph.facebook.com';
	AWS.config.credentials = new AWS.WebIdentityCredentials(webCredPack);
	
	dy = new AWS.DynamoDB(conf.doc.awsConfigPack);
	dy.listTables(function(err, data) {
	    if(err){
		// maybe parse the meaningless aws error messages?
		console.log(err);
	    }

	    tables = data.TableNames;
	    Cani.core.cast('dy', true, tables);

	});
    };

    Cani.core.on('config: doc noauth', function(conf){ DYCONF(conf, 'noauth');} );
    Cani.core.on('fb', function(conf){ DYCONF(conf, 'fb');} );
    Cani.core.on('google', function(conf){ DYCONF(conf, 'google');} );


    // expose save and load functions

    doc.save = function(schema, data, options){

	// loop through schema, fill pack
	var pack = {};


	// make request and return promise
	var deferred = Q.defer();
	dy.putItem({TableName:tableName, Item:pack}, function(err, res){
	    if(err){
		console.log(err);
		// parse aws error msg
	    }
	    deferred.resolve(res);
	});
	return deferred.promise;
    };

    doc.load = function(schema, query, options){

    };


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


})(Cani.file||{});


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


