Cani.firebase = (function(firebase){
    var ref;
    var baseurl;

    // put schemas and containers into frebase online
    // futz with the fb profile package and max it out

    Cani.core.on('config: firebase', function(conf){
	firebase.baseurl = baseurl = conf.firebase.url;
	ref = new Firebase(conf.firebase.url);
	firebase.ref = ref;

// point this to firebase.auth.fb.onLogin(fn)
// https://www.firebase.com/docs/web/guide/login/facebook.html
	if(conf.firebase.initOn.indexOf('fb: login')>-1){
	    Cani.core.confirm('fb: login').then(function(fb){
		// login firebase
		ref.authWithOAuthPopup("facebook", function(error, authData) {
		    if(error)
			console.log("Login Failed!", error);
		    else
			Cani.core.affirm('firebase: fb-login', authData);
		});
	    });
	}

console.log('affirm firebase', firebase);
	Cani.core.affirm('firebase', firebase);
    });

    firebase.write = function(path, data){
	
    };

    firebase.read = function(path, eventType){
	// use eventType = value for reads
	// child_added for array pushes
	// child changed/removed for collection ops
	// child_moved for ordered collections

	// value triggered last (does this matter?)


	// once for .once? yep... gonna need that
//	var ref = new Firebase("https://docs.firebaseio.com/web/org/users/mchen/groups/alpha");
//	ref.once('value', function(snap) {
//	    var result = snap.val() === null? 'is not' : 'is';
//	    console.log('Mary ' + result + ' a member of alpha group');
//	});


	var def = Q.defer();
	(new Firebase(baseurl+'/'+path)).on(eventType||'value', function(snapshot){
	    def.resolve(snapshot.val())
	}, function(err){
	    def.reject(err);
	});

	return def.promise;

	// to kill this callback, save a ref to the ref and .off the eventType
	// aka fix this code for to no memory leak
    };

    firebase.query = function(path, orderBy){
	// can only order each path-query once at a time
	// keep an index of active queries
	var ref = new Firebase("https://dinosaur-facts.firebaseio.com/dinosaurs");

//	ref.orderByKey().on("child_added", function(snapshot){

// limitTo First/Last, orderByValue

//	ref.orderByChild("weight").limitToLast(2).on("child_added", function(snapshot){
//	ref.orderByChild("height").limitToFirst(2).on("child_added", function(snapshot) {

//	var scoresRef = new Firebase("https://dinosaur-facts.firebaseio.com/scores");
//	scoresRef.orderByValue().limitToLast(3).on("value", function(snapshot) {

// startAt(), endAt(), and equalTo()

//	ref.orderByChild("height").startAt(3).on("child_added", function(snapshot) {
//	ref.orderByKey().endAt("pterodactyl").on("child_added", function(snapshot) {
//	ref.orderByKey().startAt("b").endAt("b~").on("child_added", function(snapshot) {
// ~ is the last "regular ascii char"
//	ref.orderByChild("height").equalTo(25).on("child_added", function(snapshot) {



	ref.orderByChild("height").on("child_added", function(snapshot){
	    console.log(snapshot.key() + " was " + snapshot.val().height + " meters tall");
	});
    };
    

    firebase.transact = function(path, transactionFn){
	var upvotesRef = new Firebase('https://docs-examples.firebaseio.com/android/saving-data/fireblog/posts/-JRHTHaIs-jNPLXOQivY/upvotes');
	upvotesRef.transaction(function (current_value) {
	    return (current_value || 0) + 1;
	});
    };

    // should have a bind/unbind
    // look into zonejs for this type of thing.



// auth stuff, should be split into sep modules?

// wire these to promise
    firebase.auth = {
	email:{
//https://www.firebase.com/docs/web/guide/login/password.html
//        ".read": "auth !== null && auth.provider === 'password'"
	    createUser:function(email, password){
//		var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com");
		var def = Q.defer();
		ref.createUser({
		    email: email,
		    password: password
		}, function(error, userData) {
		    if (error) {
			def.reject(error);
		    } else {
			Cani.core.cast('firebase-auth: email-create-user');
			def.resolve(userData);
		    }
		});
		return def.promise;
	    },
	    login:function(email, password, remember){
//		var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com");
		var def = Q.defer();
		ref.authWithPassword({
		    email: email,
		    password: password
		}, function(error, authData) {
		    if (error) {
			def.reject(error);
		    } else {
			Cani.core.affirm('firebase-auth: email-login', authData);
			def.resolve(authData);
		    }
		}, { // do this in an option?
		    remember: remember||"sessionOnly"
		});
		return def.promise;
	    },

	    changeEmail:function(oldEmail, nuEmail, password){
//		var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com");
		ref.changeEmail({
		    oldEmail : oldEmail,
		    newEmail : nuEmail,
		    password: password
		}, function(error) {
		    if (error === null) {
			console.log("Email changed successfully");
		    } else {
			console.log("Error changing email:", error);
		    }
		});
	    },
	    changePassword:function(email, oldPassword, nuPassword){
//		var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com");
		ref.changePassword({
		    email: email,
		    oldPassword: oldPassword,
		    newPassword: nuPassword
		}, function(error) {
		    if (error === null) {
			console.log("Password changed successfully");
		    } else {
			console.log("Error changing password:", error);
		    }
		});
	    },
	    sendPasswordReset:function(email){
//		var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com");
		ref.resetPassword({
		    email: email
		}, function(error) {
		    if (error === null) {
			console.log("Password reset email sent successfully");
		    } else {
			console.log("Error sending password reset email:", error);
		    }
		});
	    },
	    deleteAccount:function(email, password){
//		var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com");
		ref.removeUser({
		    email: email,
		    password: password
		}, function(error) {
		    if (error === null) {
			console.log("User removed successfully");
		    } else {
			console.log("Error removing user:", error);
		    }
		});
	    }
	}
    };


    firebase.connection = function(){
//https://www.firebase.com/docs/web/guide/offline-capabilities.html
	var connectedRef = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com/.info/connected");
	connectedRef.on("value", function(snap) {
	    if (snap.val() === true) {
		alert("connected");
	    } else {
		alert("not connected");
	    }
	});
    };


    return firebase;

})(Cani.firebase||{});
