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
    var objs = {};


    var readwrite = IDBTransaction.READ_WRITE || 'readwrite';

    var schemas;


// think of a way of handling the various schemae - should be simple
   // so long as the schemae are confd to the db
// 

    var IDBCONF = function(conf, provider){

	schemas = conf.indexeddb.schemas;

	var opendbrequest = window.indexedDB.open(conf.idbname, conf.idbversion);

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
	    };

	    // check that the objectstores are the same as the currentdb
	    // if yes, Cani.core.affirm('idb', indexeddb);
console.log(indexeddb);
	    // otherwise, affirm after fixing that in onupgradeneeded
	    Cani.core.affirm('idb', indexeddb);
	};

	opendbrequest.onupgradeneeded = function(event) { 
	    db = event.target.result;

console.log(db.objectStoreNames);

	    for(var schemaName in schemas){
		var schema = schemas[schemaName];

		// if(conf.indexeddb.diffs[from][to]) ...

		// options for schema per mozilla::

		// multientry indices...
		//
		// keyPath or autoIncrement


		// index . unique

		objs[schemaName] = db.createObjectStore(schemaName, { keyPath: schema.keyPath });

		for(var index in schema.indices){
		    objs[schemaName].createIndex(index.name, index.keyPath||index.name, index.options);
		}
/*
		objs[schemaName].transaction.oncomplete = function(event) {
		    // Store values in the newly created objectStore.
		    var customerObjectStore = db.transaction("customers", "readwrite").objectStore("customers");
		    for (var i in customerData) {
			customerObjectStore.add(customerData[i]);
		    }
		}
*/
	    }


	    // pull the objectstore descriptions out of the conf
	    // pull the old description, data - port it over as described
	    // create the new objectstores and fill them if necc.
	};

	console.log('conf indexeddb');
	Cani.core.affirm('idb', indexeddb);
    };

    indexeddb.save = function(schemaName, data){
	// use the schema description, create a readwrite transaction request
	// resolve the promise onsuccess
	// error the promise on error
	console.log('save');

	var schema = schemas[schemaName];

	var transaction = db.transaction([schemaName], 'readwrite');
	
	// report on the success of opening the transaction
	transaction.oncomplete = function(event) {
            console.log('complete save', event);
	};

	transaction.onerror = function(event) {
            console.log('err save', event);
	};

	var objectStore = transaction.objectStore(schemaName);

	var request = objectStore.add(data);        

        request.onsuccess = function(event) {
	    console.log('saved', event);
	};

    };

    indexeddb.load = function(schemaName, query){
	// use the schema description, create a readonly transaction request

	console.log('load');

	var schema = schemas[schemaName];

	var objectStore = db.transaction(schemaName).objectStore(schemaName);
	objectStore.openCursor().onsuccess = function(event) {
	    var cursor = event.target.result;

            if(cursor) {
		console.log('loaded item ', cursor);
	    }
	};

    };

    Cani.core.on('config: indexeddb noauth', function(conf){ IDBCONF(conf, 'noauth');} );

    return indexeddb;

})(Cani.indexeddb||{});
