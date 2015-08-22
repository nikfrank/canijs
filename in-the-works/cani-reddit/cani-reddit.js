Cani.reddit = (function(reddit){
    // expect schemas in conf.file to map saves/loads, confirm permissions properly

    reddit.domain = 'http://reddit.com';

    var REDCONF = function(conf){
	// for oathed parts of api only

	// ...

	reddit.domain = 'https://oauth.reddit.com';

	Cani.core.affirm('redditUser', true);
    };

    Cani.core.on('redditAuth', function(conf){ REDCONF(conf, 'user');} );


// this needs to be fixed on the heroku app
// env = {dev:{client_id:'devapp', url:'localhost:9012'},
//        dist:{client_id:'distapp', url:'zpv.herokuapp.com'}}

    reddit.login = function(state){
	document.location = 'https://ssl.reddit.com/api/v1/authorize.compact?client_id=-9Hm5PfhIZJiIw&response_type=code&state='+state+'&redirect_uri=http://localhost:9012/redditloggedin&duration=permanent&scope=identity';

    };

    reddit.setToken = function(token){
	reddit.token = token;
	// cast the auth
	Cani.core.cast('redditAuth', true);
    };


    window.caniredditjsonpcb = {};

    var next = 0;

    var jsonpcall = function(src, cb){

	src += '&jsonp=caniredditjsonpcb['+next+']';

	window.caniredditjsonpcb[next] = cb;

	(function(d){
	    var js, ref = d.getElementsByTagName('script')[0];
	    js = d.createElement('script');
	    js.async = true;	    
	    js.src = src;
	    js.id = 'redditjsonp'+next;
	    ref.parentNode.insertBefore(js, ref);
	}(document));

	next++;

    };

    reddit.get = function(url, options, callback){
	if(typeof options === 'function'){
	    callback = options;
	    options = {};
	}

	if(!options) options = {};
	if(!options.limit) options.limit = 25;

	(function(nn){
	    jsonpcall(reddit.domain+url+'?limit='+options.limit, function(data){
		delete window.caniredditjsonpcb[nn];

		var element = document.getElementById('redditjsonp'+nn);
		element.parentNode.removeChild(element);

		callback(data);
	    });
	})(next);
    };

    // ...

    // somewhere in here is a login function
    // then on sign out there should be a disconfirm
    // that should be put into fb as well.

    reddit.r = function(sub, options){
	
	var deferred = Q.defer(); // deferred.resolve/reject to do data/error

	sub = sub.split('?')[0];// security!!!

	reddit.get('/r/'+sub+'.json', options, function(data){
	    deferred.resolve(data);
	});
	
	return deferred.promise;
	
    };

    return reddit;

})(Cani.reddit||{});
Cani.core.affirm('reddit', true);
