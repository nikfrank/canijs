if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

Cani.phonegap = (function(phonegap){

    var PHONEGAPCONF = function(conf){
	console.log('phonegapConf');
	Cani.core.affirm('phonegap', phonegap);
    };

    Cani.core.on('config: phonegap', function(conf){
	// check that phonegap has loaded, or wait for deviceReady
	window.__phonegapReady?
	    PHONEGAPCONF(conf):
            document.addEventListener('deviceready', function(){
		PHONEGAPCONF(conf);
	    }, false);
    });
    
    // expose save and load functions

    return phonegap;

})(Cani.phonegap||{});
