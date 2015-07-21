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

	Cani.core.affirm('storage', storage);
    };
    LSCONF();

    storage.read = function(schema, query){
	var def = Q.defer();
	
	// match query against index, map out items from storage

	def.resolve('ok');

	return def.promise;
    };

    storage.write = function(schema, query){
	var def = Q.defer();
	
	// if item exists, overwrite. else write & save to index

	def.resolve('ok');

	return def.promise;
    };

    storage.count = function(schema, query){
	var def = Q.defer();
	
	// count the hashes who match the predicate in the index

	def.resolve('ok');

	return def.promise;
    };

    storage.erase = function(schema, query){
	var def = Q.defer();
	
	// match from the index. erase matches from index and storage

	def.resolve('ok');

	return def.promise;
    };


    return storage;

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
