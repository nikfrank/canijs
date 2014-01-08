var cani = (function(cc) {

    var privvy;
//------------------config

    cc.config = function(conf){
	// conf = {fbApp:'appid'}

	if(typeof conf.fbApp !== 'undefined'){
	    window.fbAsyncInit = function() {
		FB.init({
		    appId      : '651024351606699',
		    status     : true, // check login status
		    cookie     : true, // enable cookies to allow the server to access the session
		    xfbml      : true  // parse XFBML
		});

		FB.Event.subscribe('auth.authResponseChange', function(response) {
		    if(response.status === 'connected'){
			FB.api('/me', function(response) {
			    console.log(response);
			});
		    } else if (response.status === 'not_authorized') {
			FB.login();
		    } else {
			//FB.login();
			alert('logged out');
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

    };


//------------------data module


    cc.save = function(index,data){
	// return promise
    };

    cc.save.doc = function(index,data){
	//
    };

    cc.save.file = function(index,data){
	//
    };

    cc.load = function(index,data){
	//
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


    return cc;

})({});
// <script src="/vendor/cani.js"></script>
