if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

Cani.indexeddb = (function(indexeddb){

     var indexedDB = window.indexedDB || window.mozIndexedDB ||
	window.webkitIndexedDB || window.msIndexedDB;

    var IDBTransaction = window.IDBTransaction ||
	window.webkitIDBTransaction || window.msIDBTransaction;

    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;


    var db;

    var readwrite = IDBTransaction.READ_WRITE || 'readwrite';
    var schemas;


    var IDBCONF = function(config, provider){

	var conf = config.indexeddb;

	console.log('idb confing', indexedDB, conf);

	schemas = conf.schemas;

	var opendbrequest = indexedDB.open(conf.idbname, conf.idbversion);

	opendbrequest.onerror = function(event) {
	    // error creating db
	    console.log('err',event);
	};

	opendbrequest.onsuccess = function(event) {
	    // success creating db
	    db = event.target.result;
	    console.log('db',db);

	    db.onerror = function(event){
		// config db general error handler
		console.log('err', event);
	    };

	    Cani.core.affirm('idb', indexeddb);
	};

	opendbrequest.onupgradeneeded = function(event) { 
	    db = event.target.result;

	    console.log('objs',db);

	    for(var schemaName in schemas){
		var schema = schemas[schemaName];

		// if(schema.fields[nuversion])[from][to]) ...
		// keyPath only!!!! I don't want people using anything else.

		if(!db.objectStoreNames.contains(schemaName)){
		    var obj = db.createObjectStore(schemaName, { keyPath: schema.keyPath });

		    (function(s,o){
			// success (bind the schemaName and create the indices)
			for(var index in s.indices){
			    o.createIndex(index, index,
					  {unique: s.indices[index].unique,
					   multiEntry: s.indices[index].multiEntry});
			}
		    })(schema, obj);

		    obj.transaction.oncomplete = function(event){
			console.log('conf indexeddb');
			Cani.core.affirm('idb', indexeddb);
		    };

		    obj.transaction.onerror = function(err){
			console.dir(err);
		    };


		}
	    }
	};

    };

// loading methods::

// load exact matches (stream, batch in promise)
// load from range (stream/batch)

// all query inputs not indexed filtered here


    indexeddb.load = function(schemaName, query){
	// use the schema description, create a readonly transaction request
// load needs to search differently for multiEntry indices

// query = { index:'nameOfIndex',
//           type:'exact/range/...',
//           val::
//           valFrom::
//           valTo::
//           callback:function(done)
//
	
	var deferred = Q.defer();
	if(0) deferred.reject(err);

	var schema = schemas[schemaName];

	query = query ||{};

	if(!query.index){
	    // set the index to the keyPath
	    query.index = schema.keyPath;
	}else if(!schema.indices[query.index]) return {err:'no index as ' + query.index};

	var objectStore = db.transaction(schemaName).objectStore(schemaName);

	//store.get(queryval);

	if(!(schema.indices[query.index]||{}).multiEntry){

	    var ret = [];

	    objectStore.openCursor().onsuccess = function(event) {
		var cursor = event.target.result;

		if(cursor) {
		    console.log('loaded item ', cursor);
		    ret.push(cursor.value);
		    cursor.continue();
		}else{
		    deferred.resolve(ret);
		}
	    };

	}else{
	    // multival is different, get that from tut
	}

	return deferred.promise;
    };

// saves and updates

    indexeddb.save = function(schemaName, data, cleanNG){

	if(cleanNG){
	    if(data.constructor == Object){
		delete data.$$hashKey;
	    }else{
		for(var i=data.length; i-->0;){
		    delete data[i].$$hashKey;
		}
	    }
	}


	var deferred = Q.defer();
	if(0) deferred.reject(err);

	var schema = schemas[schemaName];

	var tcn = db.transaction([schemaName], readwrite);
	
	tcn.oncomplete = function(event) {
            console.log('complete save tcn ', event);
	};

	tcn.onerror = function(event) {
            console.log('err save tcn ', event);
	};

	var store = tcn.objectStore(schemaName);

	if(data.constructor == Object){

	    var request = store.add(data);        

            request.onsuccess = function(event) {
		console.log('saved', event);

		deferred.resolve(event);// fix this
	    };

	}else if(data.constructor == Array){
	    // loop over them?

	    var i = 0;
	    putNext();

            function putNext(res) {
		if (i<data.length) {
                    store.add(data[i]).onsuccess = putNext;
                    ++i;
		} else {   // complete
                    console.log('populate complete');
		    deferred.resolve(res);

		}
            }  
	}

	return deferred.promise;

    };

    indexeddb.update = function(schemaName, data, cleanNG){

	if(cleanNG) delete data.$$hashKey;

	var deferred = Q.defer();
	if(0) deferred.reject(err);

	var schema = schemas[schemaName];

	var tcn = db.transaction([schemaName], readwrite);
	
	tcn.oncomplete = function(event) {
            console.log('complete save tcn ', event);
	};

	tcn.onerror = function(event) {
            console.log('err save tcn ', event);
	};

	var store = tcn.objectStore(schemaName);

	var request = store.put(data);        

        request.onsuccess = function(event) {
	    console.log('saved', event);

	    deferred.resolve(event);//fix this
	};

	return deferred.promise;

    };


    indexeddb.upsert = function(schemaName, query){
	// determine which to call, just call that
	var deferred = Q.defer();
	if(0) deferred.reject(err);

	deferred.resolve('not written yet');

	return deferred.promise;
    };


    indexeddb.count = function(schemaName){
	
	var deferred = Q.defer();
	if(0) deferred.reject(err);

	db.transaction([schemaName],"readonly").objectStore(schemaName).count().onsuccess = function(event) {
	    deferred.resolve(event.target.result);
	};
	
	return deferred.promise;
    }

    indexeddb.erase = function(schemaName, keyPathVal){
	// also allow the second param to be the entire item, which should be checked before erasure

	var deferred = Q.defer();
	if(0) deferred.reject(err);

	var request = db.transaction([schemaName], readwrite).objectStore(schemaName).delete(keyPathVal);
	
	request.onsuccess = function(event) {
	    console.log('deleted ', keyPathVal,' from ', schemaName, ' with ', event);
	    deferred.resolve(true);
	};

	request.onerror = function(err){
	    console.log('throwing error on erase '+schemaName+': '+keyPathVal+' :: '+err);
	    deferred.reject(err);
	};

	return deferred.promise;
    };

    indexeddb.eraseAll = function(schemaName){

	var deferred = Q.defer();
	if(0) deferred.reject(err);

	var schema = schemas[schemaName];

	var objectStore = db.transaction(schemaName, readwrite).objectStore(schemaName);



	var tcn = objectStore.openCursor(); 
	tcn.onsuccess = function(event) {
	    var cursor = event.target.result;

	    if (cursor) {
console.log(cursor.primaryKey);
		cursor.delete();
		cursor.continue();
	    }else{
		deferred.resolve({done:'success'});
	    }
	};

	return deferred.promise;
	
    };


    // put in functionality for running a lambda on a cursor

    Cani.core.on('config: indexeddb noauth', function(conf){ IDBCONF(conf, 'noauth');} );

    return indexeddb;

})(Cani.indexeddb||{});
