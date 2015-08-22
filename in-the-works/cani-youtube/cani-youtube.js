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
		var ret = [];
		for(var i = pon.feed.entry.length; i-->0;){
		    var ent = pon.feed.entry[i];
		    var retent = {hash: ent.content.src.split('?')[0].substr(26),
				  author: ent.author[0].name.$t,
				  title: ent.title.$t,
				  duration: ent.media$group.media$content[0].duration,
				  link:ent.content.src
				 };
		    retent.imgsrc = 'http://img.youtube.com/vi/'+retent.hash+'/1.jpg';

		    retent.time = (new Date(null, null, null, null, null, retent.duration)).toTimeString().split(' ')[0];
		    ret.unshift(retent);
		    
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
