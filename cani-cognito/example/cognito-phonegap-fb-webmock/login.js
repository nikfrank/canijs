'use strict';

var fbpermissions = ['email'];

Cani.core.confirm(['cognito','phonegap-fb']).then(function(){
    if(!window.cordova)
	// in a webmock scenario, cani-phonegap-fb will set this.plugin to undefined
	// so what we're doing here is mocking the phonegapFb plugin's login
	Cani.phonegapFb.plugin = {
	    login:function(permissions, success, failure){
		return Cani.core.confirm('fb: login')
		    .then(function(loginData){return {authResponse:loginData};})
		    .then(success, failure);
	    }
	};
    
    Cani.phonegapFb.login(fbpermissions)
	.then(Cani.cognito.onLogin)
	.then(function(userData){
            console.log(userData);
            document.getElementById('user-data').innerHTML = JSON.stringify(userData);
        });
});

if(!window.cordova) Cani.core.affirm('phonegap');
