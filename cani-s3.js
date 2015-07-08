if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

Cani.s3 = (function(s3){
    // expect schemas in conf.file to map saves/loads, confirm permissions properly

    var sss; // aws s3 singleton

    var S3CONF = function(conf, provider){

	sss = new AWS.S3({params: {Bucket: conf.s3.Bucket } });
	sss.Bucket = conf.s3.Bucket;

	// is there a list available buckets function? idk
	Cani.core.affirm('s3', s3);
    };

    Cani.core.on('config: s3', S3CONF);

    // expose save and load functions

    


    s3.upload = function(bucket, key, fileData, credentials){
	var def = Q.defer();
	sss.upload({Bucket: bucket, Key: key, Body: fileData}, function(err, data){
	    err?
		def.reject(err):
		def.resolve(data);
	    
	});
	return def.promise;
    };

    return s3;

})(Cani.s3||{});
