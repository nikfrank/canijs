'use strict';

var fbpermissions = ['email'];

// I haven't taken the time to boot this into
// an actual phonegap app.

// however, I think I CnVd it straight outa one
// so it should work?

Cani.core.confirm(['cognito','phonegap-fb']).then(function(){
    Cani.phonegapFb.login(fbpermissions)
	.then(Cani.cognito.onLogin)
	.then(console.log.bind(console));
});




