if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

Cani.s3 = (function(s3){
    // expect schemas in conf.file to map saves/loads, confirm permissions properly

    var sss; // aws s3 singleton
    var s3conf;

    var S3CONF = function(conf, provider){
	s3conf = conf;
	// is there a list available buckets function? idk
	Cani.core.affirm('s3', s3);
    };

    Cani.core.on('config: s3', S3CONF);

    // expose save and load functions

    
    s3.init = function(credentials){
	// only do this AFTER the credentials come in.
	sss = new AWS.S3({params: {Bucket: s3conf.s3.Bucket } });
	sss.Bucket = s3conf.s3.Bucket;	
    };


    s3.upload = function(bucket, key, fileData){
	var def = Q.defer();
console.log(AWS.config);
	sss.upload({Bucket: bucket||s3conf.s3.Bucket, Key: key, Body: fileData}, function(err, data){
	    err?
		def.reject(err):
		def.resolve(data);
	    
	});
	return def.promise;
    };

    return s3;

})(Cani.s3||{});
