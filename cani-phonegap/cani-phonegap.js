Cani.phonegap = (function(phonegap){

    var PHONEGAPCONF = function(conf){
	console.log('phonegapConf');
	Cani.core.affirm('phonegap', phonegap);
    };

    Cani.core.on('config: phonegap', function(conf){
	// check that phonegap has loaded, or wait for deviceReady
// I think this is deprecated.
	window.__phonegapReady?
	    PHONEGAPCONF(conf):
            document.addEventListener('deviceready', function(){
		PHONEGAPCONF(conf);
	    }, false);
    });
    
    return phonegap;

})(Cani.phonegap||{});
