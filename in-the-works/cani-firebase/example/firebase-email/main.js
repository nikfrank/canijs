'use strict';

angular.module('firebase-email', ['ui.router']).run(function($q){ window.Q = $q; })

.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise("/");

    $stateProvider.state('login', {
	url: "/",
	templateUrl: "views/login.html",
	controller: 'LoginCtrl as login'

    }).state('main', {
	url: "/main",
	templateUrl: "views/main.html",
	controller: 'MainCtrl as ctrl',
	resolve:{
	    CaniDep:function(auth){ // this DI is what triggers login on refresh from #/main
		console.log('confirming...');
		return Cani.core.confirm(['firebase-auth: email-login']);
	    }
	}
    });
})

.service('auth', function($state){
    var that = this;
    this.confirmLogin = Cani.core.confirm('firebase-auth: email-login')
	.then(console.log.bind(console))
	.then(function(){
	    $state.go('main');
	})
    // then forward to the main state
})

.controller('LoginCtrl', function(auth, $state){ // this DI is what triggers login from new page load
    auth.confirmLogin.then(function(cogId){
	$state.go('main');
    });
    this.login = function(email, password){
	// login to firebase
	Cani.firebase.auth.email.login(email, password)
	    .then(function(res){
		console.log('logged in', res);
	    }, function(err){
		console.log('login failed', err);
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

.controller('MainCtrl', function(){
    var that = this;


    console.log(Cani.firebase);

    Cani.core.confirm('firebase').then(function(firebase){
	console.log(firebase);

	// expose auth functions TO A SCOPE OBJ
	window.login = firebase.auth.login;
	window.signup = firebase.auth.createUser;
	window.sendNuPassword = firebase.auth.sendPasswordReset;
    });
});

