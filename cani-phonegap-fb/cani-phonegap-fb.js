if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

Cani.phonegapFb = (function(phonegapFb){

    var FBGCONF = function(conf){
	phonegapFb.plugin = window.facebookConnectPlugin || Cani.phonegap.fb;
	Cani.core.affirm('phonegap-fb', phonegapFb);
    };

    Cani.core.confirm('phonegap').then(function(conf){FBGCONF(conf);});

// work out long term token logins

    phonegapFb.login = function(permissions){
	var def = Q.defer();
	phonegapFb.plugin.login(permissions||[], def.resolve, def.reject);
	return def.promise;
    };	


    return phonegapFb;

})(Cani.phonegapFb||{});
