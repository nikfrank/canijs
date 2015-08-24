'use strict';

// could be
// Cani.core.confirm(['cognito', 'fb: login']).then(R.prop('fb: login') ...

Cani.core.confirm('cognito').then(function(){
    Cani.core.confirm('fb: login')
	.then(function(loginData){return {authResponse:loginData};})
	.then(Cani.cognito.onLogin)
	.then(console.log.bind(console));
});
