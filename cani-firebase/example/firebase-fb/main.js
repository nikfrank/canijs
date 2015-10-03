'use strict';

angular.module('firebase-fb', ['ui.router']).run(function($q){ window.Q = $q; })

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
		Cani.core.confirm('firebase-auth: fb-login').then(function(authData){
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
		return Cani.core.confirm('firebase-auth: fb-login');
	    },
	    firebase:function(){
		return Cani.core.confirm('firebase');
	    }
	}
    });
})

.service('auth', function($state){
    var that = this;

    this.confirmLogin = Cani.core.confirm('firebase-auth: fb-login')
	.then(function(authData){ return that.authData = authData;})
    // save authData on login to the auth service in case we need it somewhere
	.then(function(){ $state.go('main');});
    // go to /main on login
})

.controller('LoginCtrl', function(auth, $state){ // this DI is what triggers login from new page load
    var that = this;
    Cani.core.confirm('firebase-auth: fb-login').then(function(authData){
	$state.go('main'); // logged in from before!
    });
})

.controller('MainCtrl', function($scope, CaniAuth, firebase, $timeout){
    var that = this;
    this.popup = false;
    this.live = false;

    this.fb = CaniAuth.facebook;
    this.login = firebase.auth.login;

    this.logout = function(){
	firebase.auth.logout().then(location.reload.bind(location));   
    };


    this.changeLiveState = function(){
	that.live = !that.live;
	if(that.live){
	    // set up three-way binding
	    // .readObs  .take .whatever .subscribe .unsubscribe?

	    firebase.readObs('notes', 'value').subscribe(function(notes){
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
	Cani.firebase.write('notes/'+CaniAuth.uid, {
	    note:note, profileImageURL:CaniAuth.facebook.profileImageURL
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

// fix this? and install rxjs
