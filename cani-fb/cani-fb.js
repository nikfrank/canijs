Cani.fb = (function(fb){

// move facebook login & sdk loading here.
// then cani-gg can be it's own thing.
// no more cani-user.

    var user;

    var FB;

    var FBGCONF = function(conf){	
	window.fbAsyncInit = function(){
	    FB.init({appId:conf.fb.App, status:true, cookie:true, xfbml:true});
	    Cani.core.affirm('fb', fb);

	    // facebook has a way to request extra permissions that should be a config option
	    FB.Event.subscribe('auth.authResponseChange', function(response) {
		if(response.status === 'connected'){
		    // record the facebook auth data, run dbconfig with it
		    user = response.authResponse;
		    
		    // grab the facebook profile
		    FB.api('/me', function(pon) {
			user.profile = pon;
			Cani.core.affirm('fb: login', user);
		    });

		}else if(response.status === 'not_authorized'){
		    //user hasnt authed the app, requests them to do so
		    FB.login();
		}else{
		    //FB.login();
		    Cani.core.defirm('fb: login');
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

    };

    return fb;
})(Cani.fb||{});
