if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

Cani.s3 = (function(s3){
    // expect schemas in conf.file to map saves/loads, confirm permissions properly

    var sss = {}; // aws s3 singleton
    var s3conf;

    var S3CONF = function(conf, provider){
	s3conf = conf;
	// is there a list available buckets function? idk
    };

    Cani.core.on('config: s3', S3CONF);

    // expose save and load functions

    s3.init = function(){
	// only do this AFTER the credentials come in.
	sss[s3conf.s3.Bucket] = new AWS.S3({params:{Bucket:s3conf.s3.Bucket}});
	sss[s3conf.s3.Bucket].Bucket = s3conf.s3.Bucket;
	Cani.core.affirm('s3', s3);
    };

    s3.initBucket = function(bucket){
	// only do this AFTER the credentials come in.
	sss[bucket] = new AWS.S3({params:{Bucket:bucket}});
	sss[bucket].Bucket = bucket;
	Cani.core.affirm('s3-bucket-'+bucket, s3);
    };

    s3.upload = function(bucket, key, fileData){
	var def = Q.defer();
	var buck = bucket||s3conf.s3.Bucket;
	sss[buck].upload({Bucket: buck, Key: key, Body: fileData}, function(err, data){
	    err?
		def.reject(err):
		def.resolve(data);
	    // handle failure
	});
	return def.promise;
    };

    s3.read = function(bucket, key){
	var def = Q.defer();
	var buck = bucket||s3conf.s3.Bucket;
	sss[buck].getObject({Bucket: buck, Key: key}, function(err, data){
	    err?
		def.reject(err):
		def.resolve(data);
	    // handle failure
	});
	return def.promise;	
    };

    return s3;

})(Cani.s3||{});
