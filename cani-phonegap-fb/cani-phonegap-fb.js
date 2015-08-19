Cani.phonegapFb = (function(phonegapFb){

    var FBGCONF = function(conf){
	phonegapFb.plugin = window.facebookConnectPlugin || Cani.phonegap.fb;
	Cani.core.affirm('phonegap-fb', phonegapFb);
    };

// the || Cani.phonegap.fb is for webmock using Cani-user. the phonegap service puts it there
// this behaviour should be moved out of angular, and into cani-phonegapfb
// whether to allow webmock can be in the config


    Cani.core.confirm('phonegap').then(function(conf){FBGCONF(conf);});

// work out long term token logins

    phonegapFb.login = function(permissions){
	var def = Q.defer();
	phonegapFb.plugin.login(permissions||[], def.resolve, def.reject);
	return def.promise;
    };	


    return phonegapFb;

})(Cani.phonegapFb||{});
