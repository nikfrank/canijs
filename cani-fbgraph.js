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

    fbgraph.searchPages = function(query){

	
	var deferred = Q.defer();

	if(!FB) return {};

	FB.api({
	    method: 'fql.query',
	    query: 'SELECT name, page_id, categories, checkins, description, description_html, fan_count, hours, is_permanently_closed, keywords, phone, pic, pic_big, pic_cover, pic_large, pic_small, pic_square, price_range, products, restaurant_services, restaurant_specialties, location FROM page WHERE page_id IN (SELECT page_id FROM place WHERE distance(latitude, longitude, "'+query.lat+'", "'+query.lng+'") < 1000)'
        },function(data) {
	    deferred.resolve(data);
        });
	/*
	FB.api('/v2.0/search?q='+encodeURI(query)+'&type=page', function(res){
	    console.log(res);
	    deferred.resolve(res);
	});
*/
	return deferred.promise;
	
    };



    return fbgraph;

})(Cani.fbgraph||{});
