'use strict';

angular.module('firebase-email', ['ui.router']).run(function($q){ window.Q = $q; })

.run(function($location, $q){
    window.Q = $q;
    $location.path('/login');
})

.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise("/login");

    $stateProvider.state('login', {
	url: "/login",
	templateUrl: "views/login.html",
	controller: 'LoginCtrl as login',
	resolve:{
	    CaniNoAuth:function($state){
		Cani.core.confirm('firebase-auth: email-login').then(function(authData){
		    $state.go('main'); // logged in from before!
		});
		// otherwise no login from before, load the login page
		return Cani.core.confirm('firebase-auth: no-persisted-login');
	    }
	}

    }).state('main', {
	url: "/main",
	templateUrl: "views/main.html",
	controller: 'MainCtrl as main',
	resolve:{
	    CaniAuth:function(auth){ // this DI is what triggers login on refresh from #/main
		return Cani.core.confirm('firebase-auth: email-login');
	    },
	    firebase:function(){
		return Cani.core.confirm('firebase');
	    }
	}
    });
})

.service('auth', function($state){
    var that = this;

    this.confirmLogin = Cani.core.confirm('firebase-auth: email-login')
	.then(function(authData){ return that.authData = authData;})
    // save authData on login to the auth service in case we need it somewhere
	.then(function(){ $state.go('main');});
    // go to /main on login
})

.controller('LoginCtrl', function(auth, $state){ // this DI is what triggers login from new page load
    var that = this;
    this.login = function(email, password){
	// login to firebase
	Cani.firebase.auth.email.login(email, password, 'default')
	    .then(function(res){
		console.log('logged in', res);
	    }, function(err){
		alert('login failed\n'+err); // the firebase err obj toString()s nicely!
	    });
    };

    this.signup = function(email, password){
	// signin to firebase
	Cani.firebase.auth.email.createUser(email, password)
	    .then(function(res){ console.log('signed up', res);},
		  function(err){ console.log('signup failed', err);})
	// trigger login (automatic, but this is easier)
	    .then(function(){ that.login(email, password);});
    };

    this.sendNuPassword = function(email){
	Cani.firebase.auth.email.sendPasswordReset(email)
	    .then(function(res){
		console.log('sent to '+email);
	    },function(err){
		console.log('err',err);
	    });
    };
})

.controller('MainCtrl', function($scope, CaniAuth, firebase, $timeout){
    var that = this;
    this.popup = false;
    this.live = false;

    this.email = CaniAuth.password.email;

    this.login = firebase.auth.login;
    this.signup = firebase.auth.createUser;

    this.changePassword = function(oldP, nuP){
	firebase.auth.email.changePassword(that.email, oldP, nuP)
	    .then(function(res){
		console.log('changed p', res);
	    }, function(err){
		console.log('failed to change p', err);
	    }).then(function(){ that.logout();});
    };

    this.changeEmail = function(password, nuE){
	firebase.auth.email.changeEmail(that.email, nuE, password)
	    .then(function(res){
		console.log('changed e', res);
	    }, function(err){
		console.log('failed to change e', err);
	    }).then(function(){ that.logout();});
    };

    this.logout = function(){
	firebase.auth.logout().then(location.reload.bind(location));   
    };


    this.changeLiveState = function(){
	that.live = !that.live;
	if(that.live){
	    // set up three-way binding
	    firebase.read('notes', 'value', function(notes){
		that.notes = notes.val();

		// note this here! no $q happiness
		// also, on write this is already in an apply. ugh
		setTimeout(function(){ $scope.$digest();},0);
	    });
	}else{
	    // kill three-way binding
	    firebase.killRead('notes', 'value');
	    that.readOnce();
	}
    };
    
    this.writeNote = function(note){
	console.log(CaniAuth.uid, {note:note, profileImageURL:CaniAuth.password.profileImageURL});
	Cani.firebase.write('notes/'+CaniAuth.uid, {
	    note:note, profileImageURL:CaniAuth.password.profileImageURL
	}).then(function(res){
	    console.log(res);
	});
    };

    this.readOnce = function(){
	firebase.readOnce('notes').then(function(notesSnap){
	    that.notes = notesSnap.val();
	});
    };
    this.readOnce();
});

