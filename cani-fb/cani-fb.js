Cani.fb = (function(fb){
    var user;

    var FBCONF = function(conf){
	window.fbAsyncInit = function(){
	    FB.init({appId:conf.fb.App, status:true, cookie:true, xfbml:true,
                     version:conf.fb.apiVersion||'v2.4'});
	    Cani.core.affirm('fb', fb);

	    // facebook has a way to request extra permissions that should be a config option
	    FB.Event.subscribe('auth.authResponseChange', function(response) {
		if(response.status === 'connected'){
		    // record the facebook auth data, run dbconfig with it
		    user = response.authResponse;
		    Cani.core.affirm('fb: auth', response.authResponse);		    

		    // grab the facebook profile
		    FB.api('/me', function(pon){
			user.profile = pon;
			Cani.core.affirm('fb: login', user);
		    });

		}else if(response.status === 'not_authorized'){
		    //user hasnt authed the app, requests them to do so
                    // this is where th auto-login comes from?
                    // maybe that should be an option nu
		    FB.login();
		}else{
		    //FB.login();
		    Cani.core.defirm('fb: login');
                    console.log('logged out canijs fb');
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

    Cani.core.on('config: fb', FBCONF);

    return fb;
})(Cani.fb||{});
