var googleSigninCallback;

var Cani = (function(cc) {

    var user = {};

    var db = {};

    var dbconf = [];

    var dbconfig = function(){
	for(var i=0; i<dbconf.length; ++i){
	    dbconf[i]();
	}
    };

//------------------config

    cc.config = function(conf){

	//------------------------------FACEBOOK AUTH---------------------------------
	// conf = {fbApp:'#_APPID_#'}
	if(typeof conf.fbApp !== 'undefined'){
	    window.fbAsyncInit = function() {
		FB.init({
		    appId      : conf.fbApp,
		    status     : true, // check login status
		    cookie     : true, // enable cookies to allow the server to access the session
		    xfbml      : true  // parse XFBML
		});

		FB.Event.subscribe('auth.authResponseChange', function(response) {
		    if(response.status === 'connected'){
			//FB.api('/me', function(pon) {
			    // put the facebook user into the user pack
			    user.fb = response.authResponse;

			    dbconfig();
			//});
		    } else if (response.status === 'not_authorized') {
			//user hasnt authed the app, requests them to do so
			
			// facebook has a way to request extra permissions that should be a config option
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

	if(typeof conf.googleId !== 'undefined'){

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

		    console.log(authResult);

		    //authResult.access_token .expires_in 
		    // these are the interesting fields

		    //   set auth token in user

		} else {
		    console.log('Sign-in state: ' + authResult['error']);
		}
	    }


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

	    dbconf.push(function(){

		AWS.config.credentials = new AWS.WebIdentityCredentials({
		    //this I grabbed from AWS's IAM role console
		    // I also had to add dynamoDB full control permission to this role
		    // after having made the table of course
		    RoleArn: 'arn:aws:iam::735148112467:role/canijstest',
		    ProviderId: 'graph.facebook.com',
		    WebIdentityToken: user.fb.accessToken
		});
		
		db.dy = new AWS.DynamoDB({region: 'us-west-2'});

		db.dy.listTables(function(err, data) {
		    if(err) console.log(err);
		    console.log(data.TableNames);
		});
	    });

	}


    };


//------------------data module


    cc.save = function(index,data){
	// make save item request to db.dy
	// for saves there should just be callbacks?
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
