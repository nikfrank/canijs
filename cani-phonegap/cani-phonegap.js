Cani.phonegap = (function(phonegap){
    var PHONEGAPCONF = function(conf){
	Cani.core.affirm('phonegap', phonegap);
    };

    Cani.core.on('config: phonegap', function(conf){
        document.addEventListener('deviceready', function(){
	    PHONEGAPCONF(conf);
	}, false);
    });

    return phonegap;
})(Cani.phonegap||{});
