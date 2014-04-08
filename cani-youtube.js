if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

Cani.youtube = (function(youtube){


    youtube.search = function(query){
	var deferred = Q.defer();

	// use query to put together the request

	var qq = 'https://gdata.youtube.com/feeds/api/videos?max-results=10&v=2&alt=json&q=';


	var request = new XMLHttpRequest();
	request.open('GET', qq+query, true);

        function ensureReadiness(){
	    if(request.readyState < 4) return;
	    if(request.status !== 200) return;
	    if(request.readyState === 4){

		var pon = JSON.parse(request.response);
console.log(pon);


		var ret = [];
		for(var i = pon.feed.entry.length; i-->0;){
		    ret.unshift(pon.feed.entry[i].content.src.split('?')[0].substr(26));
		}

		deferred.resolve(ret);
	    }
        }
	request.onreadystatechange = ensureReadiness;
	request.send();


	return deferred.promise;
    };

Cani.core.affirm('youtube', youtube);

console.log(youtube);
    return youtube;

})(Cani.youtube||{});
