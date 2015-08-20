if(typeof window['Q'] === 'undefined'){
    if(typeof window['angular'] === 'undefined'){
	alert('Im crashing because I dont have q');
	window.crashbecauseQ = true;
    }else{
	window['Q'] = window['angular'].injector(['ng']).get('$q');
//	console.log(Q);
    }
}

var Cani = Cani || {};

Cani.core = (function(core){
    // core is just notifications and confirmations
    
    var config = {};
    core.config = config;

    var note = {};//notifications

    core.cast = function(asset, flush, params){
	if(typeof asset === 'string'){
	    if(typeof note[asset] === 'undefined') return;
	    for(var i=0; i<note[asset].length; ++i) note[asset][i](params);
	    if(flush) note[asset] = [];
	}else if(asset instanceof RegExp){
	    for(var ff in note){
		if(asset.test(ff)){
		    for(var i=0; i<note[ff].length; ++i) note[ff][i](params);
		    if(flush) note[ff] = [];
		}
	    }
	}
    };

    core.on = function(asset, tino){
	if(typeof note[asset] === 'undefined') note[asset] = [];
	note[asset].push(tino);
	// in order to achieve multi-asset casting, use the affirmation system
	// ie, when something loads, affirm. to wait on something, confirm().then
    };

    var assets = {};
    core.assets = assets;

    core.confirm = function(asset, prefix){

	if(!prefix) prefix = 'confirm';

	var deferred = Q.defer();

	if(typeof asset === 'string'){
	    if(asset in assets){
		deferred.resolve(assets[asset]);
	    }else{
		// register note for confirmation
		if(typeof note['confirm: '+asset] === 'undefined'){
		    note[prefix+': '+asset] = [];
		}
		core.on(prefix+': '+asset, function(){
		    deferred.resolve(assets[asset]);
		});
	    }
  	    return deferred.promise;

	}else if(typeof asset === 'object'){
	    // check that all of the assets are present, return as collection

	    // cheeky way to do this is to find the first missing asset
	    //    then on it's load register the same confirm
	    // if everything is here send it all back
	    // technically this would work for arrays of arrays of assets. WoAh.
	    var everything = true;
	    for(var se in asset){
		var s = (asset.constructor == Array)? asset[se] : se;
		if(!(s in assets)){
		    everything = false;
		    core.confirm(s).then(function(singleAsset){
			core.confirm(asset).then(function(allAssets){
			    deferred.resolve(allAssets);
			});
		    });
		    break;
		}
	    }
	    if(everything){
		var ret = {};
		for(var se in asset){
		    var s = (asset.constructor == Array)? asset[se] : se;
		    ret[s] = assets[s];
		}
		deferred.resolve(ret);
	    }
	    return deferred.promise;
	}
    };

    core.disconfirm = function(asset){
	return core.confirm(asset, 'defirm');
    };

    core.affirm = function(asset, module){
	if(!(asset in assets)) assets[asset] = module;
	core.cast('confirm: '+asset, true);
    };

    core.defirm = function(asset, params){
// call the module's defirmation handler
	if(assets.indexOf(asset)>-1) delete assets[asset];
// check that this doesn't delete the entire module
	core.cast('defirm: '+asset, true, params);
    };

    core.boot = function(conf){
	// any config requiring something else to register on that thing's cast
	// also, if the config file were to determine boot, this would be the place to read that

	config = conf;
	return core.cast(/config/, true, conf);
    };

    return core;

})(Cani.core||{});
