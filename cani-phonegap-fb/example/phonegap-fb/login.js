'user strict';

var fbpermissions = ['email'];

Cani.core.confirm('phonegap-fb')
    .then(function(){
	return Cani.phonegapFb.login(fbpermissions);
    })
    .then(console.log.bind(console));




