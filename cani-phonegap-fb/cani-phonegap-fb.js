Cani.phonegapFb = (function(phonegapFb){

    var FBGCONF = function(conf){
	phonegapFb.plugin = window.facebookConnectPlugin;
	Cani.core.affirm('phonegap-fb', phonegapFb);
    };

// does this even run on webmock? yes, by means of a hand-affirm by setPassing the phonegap service
    Cani.core.on('config: phonegap-fb', function(conf){
	Cani.core.confirm('phonegap').then(function(){FBGCONF(conf);});
    });

// work out long term token logins

    phonegapFb.login = function(permissions){
	var def = Q.defer();
	phonegapFb.plugin.login(permissions||[], def.resolve, def.reject);
	return def.promise;
    };	

    return phonegapFb;
})(Cani.phonegapFb||{});
