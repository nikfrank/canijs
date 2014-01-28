var googleSigninCallback;

var copy = function(r){return JSON.parse(JSON.stringify(r));};

if(typeof window['Q'] === 'undefined'){
    window['Q'] = window['angular'].injector(['ng']).get('$q');
    console.log(Q);
}

var Cani = (function(cc) {

    var user = {};

    var db = {};

    var dbconf = [];

    var dbconfig = function(provider){
	console.log(dbconf);
	for(var i=0; i<dbconf.length; ++i){
	    dbconf[i](provider);
	}
    };

    var note = {};//notifications

    var callAndFlushNotes = function(asset){
	if(typeof note[asset] === 'undefined') return;

	for(var i=0; i<note[asset].length; ++i){
	    note[asset][i]();
	    console.log(asset);
	}
    };

//------------------config

    cc.config = function(conf){

	if(typeof conf.authOrder !== 'undefined') cc.authOrder = conf.authOrder;

	//------------------------------FACEBOOK AUTH---------------------------------
	// conf = {fbApp:'#_APPID_#'}
	if(typeof conf.fb !== 'undefined') if(typeof conf.fb.App !== 'undefined'){
	    window.fbAsyncInit = function() {
		FB.init({
		    appId      : conf.fb.App,
		    status     : true, // check login status
		    cookie     : true, // enable cookies to allow the server to access the session
		    xfbml      : true  // parse XFBML
		});

		// facebook has a way to request extra permissions that should be a config option
		FB.Event.subscribe('auth.authResponseChange', function(response) {
		    if(response.status === 'connected'){

			// record the facebook auth data, run dbconfig with it
			user.fb = response.authResponse;
			dbconfig('fb');
			console.log('fb db config');
			
			// grab the facebook profile
			FB.api('/me', function(pon) {
			    user.fb.profile = pon;
			    //if(typeof notns.fbme !== undefined) notns.fbme(pon);
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

	//-------------------------------GOOGLE AUTH--------------------------------

	if(typeof conf.google !== 'undefined') if(typeof conf.google.App !== 'undefined'){

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
		    dbconfig('google');

		    // grab the google profile
		    gapi.client.load('plus','v1', function(){
			var request = gapi.client.plus.people.get({
			    'userId': 'me'
			});
			request.execute(function(resp) {
			    user.google.profile = resp;
			    //if(typeof notns.ggme !== undefined) notns.ggme(resp);
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

		document.getElementById('gSigninWrapper').setAttribute('style', 'display: block');

		signinButton.addEventListener('click', function() {
		    gapi.auth.signIn(additionalParams); // Will use page level configuration
		});
	    },300);
	}


	//-------------------------dynamoDB config----------------------------------

	// federated auth will require that this be a callback on some other auth

	if(typeof conf.aws !== 'undefined'){
	    //config amazon, whose singleton must already exist

	    dbconf.push(function(provider){ //provider =<= ['fb', 'google', ('aws')]

		var webCredPack = {
		    //this I grabbed from AWS's IAM role console
		    // I also had to add dynamoDB full control permission to this role
		    // after having made the table of course
		    RoleArn: conf[provider].IAMRole,
		    WebIdentityToken: user[provider].accessToken
		    // this currently assumes that dbconfig will be run after the first auth takes place.
		    // obviously this would have to be different for an app which uses double auth (why though?)
		}


		if(provider === 'fb') webCredPack.ProviderId = 'graph.facebook.com';

		AWS.config.credentials = new AWS.WebIdentityCredentials(webCredPack);
		
		db.dy = new AWS.DynamoDB({region: 'us-west-2'});

		db.dy.listTables(function(err, data) {
		    if(err) console.log(err);
		    if(typeof user[provider].tables === 'undefined') user[provider].tables = {};
		    user[provider].tables.dy = data.TableNames;
		    //if(typeof notns.dydb !== undefined) notns.dydb();

		    //callback on dynamo table ready
		    callAndFlushNotes('db.dy');

		});
	    });

	}


    };


//------------------data module


    cc.save = function(index,data){
	// make save item request to db.dy
	// this to be moved to db.save.dy or something of the sort when are many databases maybe
	// then this function would only call the correct database save function
	
	//here check the format of the data, can be:

	// [{key:'', value:..(,type:'')}...] implemented
	// {key1:value1, ...}

	var pack = {};
	var destrings = [];

	if(data.constructor == Array){
	    for(var it in data){
		if(data[it].val === '') continue;
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

	    if(JSON.stringify(destrings).length > 4) pack['destrings'] = {'SS':destrings};

	}else if(data.constructor == Object){
	    pack = data;
	}

	var tableName = '';

	pack.docType = {'S':index};

	pack.owner = {'S':''};
	for(var authTypeNum in cc.authOrder){
	    var authType = cc.authOrder[authTypeNum];
	    if(typeof user[authType] !== 'undefined'){
		pack.owner = {'S':authType+'||'+user[authType].profile.id};//lucky thats the same already

		if(typeof user[authType].tables !== 'undefined') 
		    if(typeof user[authType].tables.dy !== 'undefined') 
			if(user[authType].tables.dy.length === 1)
			    tableName = user[authType].tables.dy[0];
		break;
	    }
	}

	pack.docId = {'S':pack.owner.S + '##' + (new Date()).getTime()};
	
	if(tableName.length<3){
	    console.log('write failed, tables not yet loaded');
	    return;
	}

	db.dy.putItem({TableName:tableName, Item:pack}, function(err, res){
	    if(err) console.log(err);
	    console.log(res);
	});
    };

    cc.save.doc = function(index,data){
	//
    };

    cc.save.file = function(index,data){
	//
    };

    cc.load = function(index,query){
	//pack up and make a query call

	var pack = {indexName:"docType-author-index"};

	var tableName = '';
	var owner = '';

	for(var authTypeNum in cc.authOrder){
	    var authType = cc.authOrder[authTypeNum];
	    if(typeof user[authType] !== 'undefined'){
		owner = {'S':authType+'||'+user[authType].profile.id};//lucky thats the same already

		if(typeof user[authType].tables !== 'undefined') 
		    if(typeof user[authType].tables.dy !== 'undefined') 
			if(user[authType].tables.dy.length === 1)
			    tableName = user[authType].tables.dy[0];
		break;
	    }
	}

	//pack.RequestItems[tableName] = {Keys:[{"docId": {"S":"fb||100000198595053##1389538315152"},
	//pack.RequestItems[tableName] = {Keys:[{"docId": {"S":"google||100153867629924152510##1389537976366"},
	pack = {TableName:tableName,
		KeyConditions:{"owner": {"ComparisonOperator": "EQ", 
					   "AttributeValueList": [owner]},
			       "docType": {"ComparisonOperator": "EQ", 
					   "AttributeValueList": [{"S":"lesson"}]}
			       }
	       };


	console.log(JSON.stringify(pack));

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
		if(typeof itm.destrings !== 'undefined'){
		    // parse the listed items in place
		}

		pon.push(itm);
	    }

	    console.log(deferred);
	    deferred.resolve(pon);
	});

  	return deferred.promise;
    };

    cc.load.batch = function(index,query){
	// return a promised array of documents that match the query

	var pack = {RequestItems:{}};

	var tableName = '';
	var owner = '';

	for(var authTypeNum in cc.authOrder){
	    var authType = cc.authOrder[authTypeNum];
	    if(typeof user[authType] !== 'undefined'){
		owner = {'S':authType+'||'+user[authType].profile.id};//lucky thats the same already

		if(typeof user[authType].tables !== 'undefined') 
		    if(typeof user[authType].tables.dy !== 'undefined') 
			if(user[authType].tables.dy.length === 1)
			    tableName = user[authType].tables.dy[0];
		break;
	    }
	}

	//pack.RequestItems[tableName] = {Keys:[{"docId": {"S":"fb||100000198595053##1389538315152"},
	//pack.RequestItems[tableName] = {Keys:[{"docId": {"S":"google||100153867629924152510##1389537976366"},
	pack.RequestItems[tableName] = {Keys:[{"owner":owner, 
					       "docType": {"S":"lesson"},
					       //"author":{"S":"nik"}
					      }]
				       };


	console.log(JSON.stringify(pack));
	db.dy.batchGetItem(pack, function(err, res){
	    //defer promise
	    console.log(res);
	});
    };

    cc.load.doc = function(index,query){
	//
    };

    cc.load.file = function(index,query){
	//
    };

//-------------------notifications module

    cc.confirm = function(asset){

	var deferred = Q.defer();

//this needs to be generalized with a window[assetSplit[n]]
	if(typeof db.dy !== 'undefined'){
	    deferred.resolve(db.dy);
	}else{

	    // register with notification singleton
	    if(typeof note[asset] === 'undefined') note[asset] = [];
	    note[asset].push(function(){ deferred.resolve(); });
	}

  	return deferred.promise;
    };



//-------------------account module

    cc.signin = function(){
	//
    };

    cc.signin.withfb = function(){
	//
    };

    cc.requireSignedIn = function(provider){
	// check user signed in with provider on all requests
    };


    return cc;

})({});
