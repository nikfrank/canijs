Cani.google = (function(google){
    var googleAuth;

    var GOOGLECONF = function(conf){
	if(typeof conf.google === 'undefined') throw 'no conf.google set';
        if(typeof conf.google.App === 'undefined') throw 'no conf.google.App set';


	window.confirmGapi = function(){
            var signOps = {
                client_id:conf.google.App,
                fetch_basic_profile:true
            };

            gapi.auth2.init(signOps).then(function(g){
                googleAuth = g;
                Cani.core.affirm('google', google);
            });

            google.login = function(){
                return googleAuth.signIn().then(function(){
                    //.getBasicProfile() // might also want?
                    return googleAuth.currentUser.get().getAuthResponse();
                });
            };

        };


	if(typeof window.gapi === 'undefined'){
	    window.gapi = {};
	    var po = document.createElement('script');
	    po.type = 'text/javascript'; po.async = true;
//	    po.src = 'https://apis.google.com/js/client:plusone.js?onload='+
	    po.src = 'https://apis.google.com/js/auth2.js?onload=confirmGapi';

	    var s = document.getElementsByTagName('script')[0];
	    s.parentNode.insertBefore(po, s);
	}

    };

    Cani.core.on('config: google', GOOGLECONF);

    return google;
})(Cani.google||{});


/*

gapi.auth has a getToken and setToken method
therefore, google signin can be a wrapper for other oauths? look into the verification for that.

*/
/*
<meta name="google-signin-clientid" content="'+conf.google.App+'" />
<meta name="google-signin-scope" content="https://www.googleapis.com/auth/plus.login">
<meta name="google-signin-requestvisibleactions" content="http://schemas.google.com/AddActivity" />
<meta name="google-signin-cookiepolicy" content="single_host_origin" />
*/
// populate these meta tags on init

function neverRunThisGarbageEver(){

// make sure this all still works eh
// also, this shouldn't have so many window.s ?
// perhaps pass in a context into the IIF?

// this is all garbage.


	    var prevggcb = window.googleSigninCallback;
	    window.googleSigninCallback = function(authResult){
		if(authResult.status.signed_in){
		    // Update the app to reflect a signed in user
		    // Hide the sign-in button now that the user is authorized, for example:

		    Cani.core.affirm('google: auth', authResult);
// put this in the auth confirm callback
// it's like someone ate Indian code and shat it all over my screen!
		    document.getElementById('gSigninWrapper').setAttribute('style', 'display: none');



		    user.authResult = authResult;
		    user.authResult.accessToken = authResult.id_token;
		    // naming consistency... don't be fooled by the "access_token" field.
                    // he does nothing
// these are old notes... the cognito user api has to be made consistent across these oauthers

		    // grab the google profile

// this is possible with gapi.client.request -> some api route that I have to guess
		    gapi.client.load('plus','v1', function(){
			var request = gapi.client.plus.people.get({
			    'userId': 'me'
			});
			request.execute(function(resp) {
			    user.profile = resp;
			    Cani.core.affirm('google: login', user.profile);
			});
		    });

		}else{
		    console.log('Sign-in state: ' + authResult.error);
		}

		if(prevggcb) prevggcb(authResult);
	    };


// this should be called in an "init" function on DOM ready by the dev
// what appears here is abhorrent.
	    setTimeout(function(){
		var additionalParams = {
		    'callback': window.googleSigninCallback
		};

		// Attach a click listener to a button to trigger the flow.
		var signinButton = document.getElementById('signinButton');

		if(document.getElementById('gSigninWrapper'))
		    document.getElementById('gSigninWrapper').setAttribute('style', 'display: block');

		if(signinButton) signinButton.addEventListener('click', function() {
		    gapi.auth.signIn(additionalParams); // Will use page level configuration
		});
	    },300); // why is this 300?
}
