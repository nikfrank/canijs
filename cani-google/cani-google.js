Cani.google = (function(google){
    var user;

// make sure this all still works eh

    var GOOGLECONF = function(conf){
	//-------------------------------GOOGLE AUTH--------------------------------
	// this requires some meta tags in the markup, also a #gSigninWrapper for the button
// grab them out of ./test/e2e-assets/ --> then populate the thing dynamically?
	if(typeof conf.user.google !== 'undefined') if(typeof conf.user.google.App !== 'undefined'){

	    window.confirmGapi = function(){
		Cani.core.affirm("gapi", {gapi:gapi, conf:conf});
	    };


	    if(typeof window.gapi === 'undefined'){
		window.gapi = {};
		var po = document.createElement('script');
		po.type = 'text/javascript'; po.async = true;
		po.src = 'https://apis.google.com/js/client:plusone.js?onload=confirmGapi';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(po, s);
	    }


	    var prevggcb = window.googleSigninCallback;
	    window.googleSigninCallback = function(authResult) {
		if (authResult.status.signed_in) {
		    // Update the app to reflect a signed in user
		    // Hide the sign-in button now that the user is authorized, for example:

		    document.getElementById('gSigninWrapper').setAttribute('style', 'display: none');

		    // record the google auth data, run dbconfig with it.
		    user.google = authResult;

		    user.google.accessToken = authResult.id_token;
		    // naming consistency... don't be fooled by the "access_token" field. he does nothing
		    // grab the google profile
		    gapi.client.load('plus','v1', function(){
			var request = gapi.client.plus.people.get({
			    'userId': 'me'
			});
			request.execute(function(resp) {
			    user.google.profile = resp;
			    Cani.core.affirm('google', user);
			});
		    });

		} else {
		    console.log('Sign-in state: ' + authResult.error);
		}

		if(prevggcb) prevggcb(authResult);
	    };


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
	    },300);
	}

    };

    Cani.core.on('config: google', GOOGLECONF);

    return google;
})(Cani.google||{});
