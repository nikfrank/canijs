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

.controller('MainCtrl', function($scope, CaniAuth){
    var that = this;
    this.user = CaniAuth.password.email;
    Cani.core.confirm('firebase').then(function(firebase){

	$scope.login = firebase.auth.login;
	$scope.signup = firebase.auth.createUser;
	$scope.sendNuPassword = firebase.auth.sendPasswordReset;

	$scope.changePassword = function(){
	    // show form to ask for old credentials and new credentials
	    firebase.auth.changePassword();
	};

	$scope.changeEmail = function(){
	    // show form to ask for old credentials and new credentials
	    firebase.auth.changeEmail();
	};

	$scope.logout = function(){
	    firebase.auth.logout().then(location.reload.bind(location));   
	};
    });
});

