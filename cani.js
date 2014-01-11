var googleSigninCallback;

var Cani = (function(cc) {

    var user = {};

    var db = {};

    var dbconf = [];

    var dbconfig = function(provider){
	for(var i=0; i<dbconf.length; ++i){
	    dbconf[i](provider);
	}
    };

//------------------config

    cc.config = function(conf){

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
			
			// grab the facebook profile
			FB.api('/me', function(pon) {
			    user.fb.profile = pon;
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
		    console.log(data.TableNames + ' ' + provider);
		});
	    });

	}


    };


//------------------data module


    cc.save = function(index,data){
	// make save item request to db.dy
	
	
    };

    cc.save.doc = function(index,data){
	//
    };

    cc.save.file = function(index,data){
	//
    };

    cc.load = function(index,data){
	// return a promised array of documents that match the query
    };

    cc.load.doc = function(index,data){
	//
    };

    cc.load.file = function(index,data){
	//
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
// <script src="/vendor/cani.js"></script>
