if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

Cani.fbgraph = (function(fbgraph){

    var FB;

    var FBGCONF = function(conf){

	if(!window.FB) console.log('nofb. wut?');
	else FB = window.FB;
	
	Cani.core.affirm('fbgraph', fbgraph);
    };

    Cani.core.on('fbsingleton', function(conf){FBGCONF(conf);} );

    fbgraph.getPicture = function(){
	
	var deferred = Q.defer();

	if(!FB) return {};

	// penguins album ID
	//926585684024709

	deferred.resolve({});

	return deferred.promise;
    };

    fbgraph.searchPages = function(){

	
	var deferred = Q.defer();

	if(!FB) return {};

	FB.api('/v2.0/search?q=tel%20aviv%20landwer&type=page', function(res){
	    console.log(res);
	deferred.resolve(res);
	});

	return deferred.promise;
	
    };

    return fbgraph;

})(Cani.fbgraph||{});
