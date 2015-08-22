'use strict';

var fbpermissions = ['email'];

Cani.core.confirm(['cognito','phonegap-fb'])
    .then(function(){
	return Cani.phonegapFb.login(fbpermissions)
	    .then(Cani.cognito.onLogin);
    })
    .then(console.log.bind(console));




