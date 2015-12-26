//function(Cani, Firebase){ return
Cani.firebase = (function(firebase){
    var ref;
    var baseurl;

    // put schemas and containers into frebase online
    // futz with the fb profile package and max it out

    Cani.core.on('config: firebase', function(conf){
	firebase.baseurl = baseurl = conf.firebase.url;
	ref = new Firebase(conf.firebase.url);
	firebase.ref = ref;

	// check for persisted auth, with future expiry
	var initAuthState = Cani.firebase.ref.getAuth();
	if((initAuthState === null)||((conf.firebase.ignoreProviders||[]).indexOf(initAuthState.provider)>-1))
	    Cani.core.affirm('firebase-auth: no-persisted-login', firebase); 
	else{
	    // send the correct auth login event if expiry is in future
	    switch(initAuthState.provider){
	    case 'password':
		Cani.core.affirm('firebase-auth: email-login', initAuthState);
		break;
	    case 'facebook':
		Cani.core.affirm('firebase-auth: fb-login', initAuthState);
		break;
	    }
	    
	}

// point this to firebase.auth.fb.onLogin(fn)
// https://www.firebase.com/docs/web/guide/login/facebook.html
	if((conf.firebase.initOn||[]).indexOf('fb: login')>-1){
	    Cani.core.confirm(['firebase-auth: no-persisted-login','fb: login']).then(function(aa){
		// login firebase
		ref.authWithOAuthPopup("facebook", function(error, authData) {
		    if(error) console.log("Login Failed!", error);
		    else Cani.core.affirm('firebase: fb-login', authData);
		});
	    });
	}

	Cani.core.affirm('firebase', firebase);
    });

    firebase.push = function(path, data){
	var def = Q.defer();
	var nuRef = ref.child(path).push();
	nuRef.set(data);

	def.resolve(nuRef.key());

	return def.promise;
    };

    firebase.write = function(path, data){
	var def = Q.defer();

	ref.child(path).set(data, function(err){
	    // keep in mind this will do overwriting
	    if(err) def.reject(err);
	    else def.resolve(data);
	});
	return def.promise;
    };

// this is unfinished!!!!
    firebase.update = function(path, data){
	var hopperRef = usersRef.child("gracehop");
	hopperRef.update({
	    "nickname": "Amazing Grace"
	}, function(err){
	    
	});
    };

// all of the reads need make new ref using path then do reading

    firebase.readOnce = function(path, eventType){
	var def = Q.defer();
	ref.child(path).once(eventType||'value', function(snap){
	    if(snap.val() === null) def.reject(snap);
	    else def.resolve(snap);
	});
	return def.promise;
    };


    firebase.read = function(path, eventType, callback, errcallback){
// this needs to be an observable stream with RXJS
// awesome.

// for now, implement callbacks - later do both concurrently

	// use eventType = value for reads
	// child_added for array pushes
	// child changed/removed for collection ops
	// child_moved for ordered collections

	// value triggered last (does this matter?)

	ref.child(path).on(eventType||'value', function(snapshot){
	    callback(snapshot);
	}, errcallback);
    };

    firebase.killRead = function(path, eventType, callback){
	return ref.child(path).off(eventType||'value', callback);
    };

    firebase.readObs = function(path, eventType){
	eventType = eventType||'value';
	var query = ref.child(path);
	return Rx.Observable.create(function(observer){
	    var listener = query.on(eventType,
		           (eventType==='value')?
			       function(snap){ observer.onNext(snap);}:
			       function(snap, prev){observer.onNext({snapshot: snap, prevName:prev});},
				    function(error){ observer.onError(error);});

	    return function(){ query.off(eventType, listener);};

	}).publish().refCount(); // this avoids duping somehow?
    };



    firebase.query = function(path, orderBy){
	// can only order each path-query once at a time
	// keep an index of active queries
//	var ref = new Firebase("https://dinosaur-facts.firebaseio.com/dinosaurs");

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



//https://www.firebase.com/docs/web/guide/login/password.html
//        ".read": "auth !== null && auth.provider === 'password'"
    firebase.auth = {
	email:{
	    createUser:function(email, password){
		var def = Q.defer();
		ref.createUser({email: email, password: password}, function(err, userData){
		    if(err) def.reject(err);
		    else{
			Cani.core.cast('firebase-auth: email-create-user');
			def.resolve(userData);
		    }
		});
		return def.promise;
	    },
	    login:function(email, password, remember){
		var def = Q.defer();
		ref.authWithPassword({email: email, password: password}, function(err, authData){
		    if(err) def.reject(err);
		    else{
			Cani.core.affirm('firebase-auth: email-login', authData);
			def.resolve(authData);
		    }
		}, {remember: remember||"sessionOnly"});
		return def.promise;
	    },

	    changeEmail:function(oldE, nuE, password){
		var def = Q.defer();
		ref.changeEmail({oldEmail:oldE, newEmail:nuE, password:password}, function(err){
		    if(err === null) def.resolve();
		    else def.reject(err);
		});
		return def.promise;
	    },
	    changePassword:function(email, oldP, nuP){
		var def = Q.defer();
		ref.changePassword({email:email, oldPassword:oldP, newPassword:nuP}, function(err){
		    if(err === null) def.resolve();
		    else def.reject(err);
		});
		return def.promise;
	    },
	    sendPasswordReset:function(email){
		var def = Q.defer();
		ref.resetPassword({email:email}, function(err){
		    if(err === null) def.resolve();
		    else def.reject(err);
		});
		return def.promise;
	    },
	    deleteAccount:function(email, password){
		var def = Q.defer();
		ref.removeUser({email:email, password:password}, function(err){
		    if(err === null) def.resolve();
		    else def.reject(err);
		});
		return def.promise;
	    }
	},
	logout:function(){
	    var def = Q.defer();
	    def.resolve(ref.unauth());
	    return def.promise;
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

})(Cani.firebase||{}); //;};

/*
if(typeof require === 'function'){
    module.exports = Canifirebase;
}else Cani.firebase = Canifirebase(Cani, Firebase)(Cani.firebase||{});
*/
