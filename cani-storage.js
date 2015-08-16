if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

Cani.storage = (function(storage){

    var LSCONF = function(conf){
	// use conf.schemas to determine if the current state is valid?
	// check the indices and load them into memory?
	// no config at all? assume schema_hash for indexing

	storage.write = function(schema, query){
	    var def = Q.defer();

	    // implement index size limiting?

	    var indexName = schema+' index';
	    var index = localStorage[indexName]||'';
	    var hash = getHash(schema, query);

	    // run an expiry?
	    if((index.match(/׆/g)||[]).length >= conf.storage.cacheSize[schema])
		storage.expire(schema, index).then(function(r){

		    if(!localStorage[hash]) localStorage[indexName] = hash+'׆'+index;
		    localStorage[hash] = JSON.stringify(query);
		    def.resolve('ok');
		},function(err){
		    console.log('erase err', err);
		});

	    return def.promise;
	};


	storage.read = function(schema, queryP){
	    var def = Q.defer();
	    if(!queryP) queryP = function(){return true;};

	    // match query against index, map out items from storage
	    var indexName = schema+' index';

	    if(!localStorage[indexName]) def.resolve([]);
	    else{
		var hashes = localStorage[indexName].split('׆').slice(0,-1);

		def.resolve(hashes.filter(queryP).map(function(h){
		    return JSON.parse(localStorage[h]);
		}));
	    }

	    return def.promise;
	};

	storage.queryHashes = function(schema, queryP){
	    var def = Q.defer();
	    
	    if(!queryP) queryP = function(){return true;};

	    // count the hashes who match the predicate in the index
	    var indexName = schema+' index';
	    if(!localStorage[indexName]) def.resolve([]);
	    else{
		var hashes = localStorage[indexName].split('׆').slice(0,-1);
		def.resolve(hashes.filter(queryP));
	    }
	    return def.promise;
	};

	storage.erase = function(schema, query){
	    var def = Q.defer();
	    
	    // match from the index. erase matches from index and storage
	    var indexName = schema+' index';
	    var index = localStorage[indexName];

	    if(!index) def.reject('did not exist - index');
	    else{
		var hash = getHash(schema, query);

		if(Object.keys(localStorage).indexOf(hash)===-1)
		    def.reject('did not exist - hash in index '+hash);
		else{
		    localStorage[indexName] = index.replace(hash+'׆', '');
		    localStorage.removeItem(hash);

		    def.resolve('ok');
		}
	    }
	    return def.promise;
	};

	storage.expire = function(schema, ind){
	    var def = Q.defer();

	    var zgz = (ind||localStorage[indexName]).split('׆').slice(0,-1)
		.map(function(r){return r.slice(r.indexOf(' ')+1)})
		.sort(conf.storage.expirySort[schema]||conf.storage.defExpirySort)
		.map(function(r){var t={};t[schema+'_hash']=r;return t;})
		.slice(0, conf.storage.expiryChunk[schema]);

	    Q.all(zgz.map(function(z){return storage.erase(schema, z);}))
		.then(function(res){
		    var indexName = schema+' index';
		    console.log(localStorage[indexName], res);
		    return res;
		})
		.then(def.resolve, def.reject);
	    
	    return def.promise;
	};


	Cani.core.affirm('storage', storage);
    };
    Cani.core.on('config: storage', LSCONF);

    return storage;

function getHash(schema, query){
    return schema+'-item '+query[schema+'_hash'];
}


})(Cani.storage||{});





//localstorage adapter to keep index of
// data-schemaName: [hashValue,..]

// and items
// data-schemaName-hashValue: stringifyOfObject

// thus the data can be queried from the index
// with arbitrary hashValue filter function



function testStorage(){
    // write actual tests in here.

    // pull democonfig.storage.schemas

    // write, check that the index was made and populated && the item was save in the right spot

    // read the stuff out into objects properly

    // query the index with a custom predicate

}
