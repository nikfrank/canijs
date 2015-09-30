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
	// login to firebase
	Cani.firebase.auth.email.createUser(email, password)
	    .then(function(res){
		console.log('logged in', res);
	    }, function(err){
		console.log('login failed', err);
	    });
    };
})

.controller('MainCtrl', function($scope, CaniAuth, firebase){
    var that = this;
    this.user = CaniAuth.password.email;

    this.login = firebase.auth.login;
    this.signup = firebase.auth.createUser;
    this.sendNuPassword = firebase.auth.sendPasswordReset;

    this.changePassword = function(){
	// show form to ask for old credentials and new credentials
	firebase.auth.changePassword();
    };

    this.changeEmail = function(){
	// show form to ask for old credentials and new credentials
	firebase.auth.changeEmail();
    };

    this.logout = function(){
	firebase.auth.logout().then(location.reload.bind(location));   
    };

    
    this.writeNote = function(note){
	console.log(CaniAuth.uid, {note:note, profileImageURL:CaniAuth.password.profileImageURL});
	Cani.firebase.write('notes/'+CaniAuth.uid, {
	    note:note, profileImageURL:CaniAuth.password.profileImageURL
	}).then(function(res){
	    console.log(res);
	});
    };

    firebase.readOnce('notes').then(function(notesSnap){
	that.notes = notesSnap.val();
	console.log(that.notes);
    });
});

