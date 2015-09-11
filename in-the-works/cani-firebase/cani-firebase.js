Cani.firebase = (function(firebase){
    var ref;

    // put schemas and containers into frebase online
    // futz with the fb profile package and max it out

    Cani.core.on('config: firebase', function(conf){
	ref = new Firebase(conf.firebase.url);
	firebase.ref = ref;


	if(conf.firebase.initOn.indexOf('fb: login')>-1){
	    Cani.core.confirm('fb: login').then(function(fb){
		console.log(fb);
		// login firebase

		ref.authWithOAuthPopup("facebook", function(error, authData) {
		    if (error) {
			console.log("Login Failed!", error);
		    } else {
			console.log("Authenticated successfully with payload:", authData);
		    }
		});

	    });
	}
    });
    

    return firebase;

})(Cani.firebase||{});
