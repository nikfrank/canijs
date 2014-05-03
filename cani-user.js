//var googleSigninCallback;

if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

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
			Cani.core.defirm('fb');
			alert('logged out');
			//location.reload();
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
		if (authResult['status']['signed_in']) {
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
		    console.log('Sign-in state: ' + authResult['error']);
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
    });


    // expose schema writers and parsers

    user.write = function(type){
	// return just the value. the database handler will package it
	var cuser;
	var pro;

	if(user.fb){
	    cuser = user.fb;
	    pro = 'fb';
	}else{
	    cuser = user.google;
	    pro = 'google';
	}

	if(type === 'id'){
	    return (pro+'||'+cuser.profile.id);
	}else if(type === 'id+date'){
	    return (pro+'||'+cuser.profile.id+'##'+(new Date()).getTime());
	}
    };

    user.parse = function(type, val){
	// using the type, split the val data into reasonable parts
    };

    return user;

})(Cani.user||{});
