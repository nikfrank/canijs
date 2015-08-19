Cani.s3 = (function(s3){
    // expect schemas in conf.file to map saves/loads, confirm permissions properly

    var sss = {}; // aws s3 singleton
    var s3conf;

    var S3CONF = function(conf, provider){
	s3conf = conf;
	// is there a list available buckets function? idk
	// document this, test this
	if('initOn' in conf.s3) conf.s3.initOn.map(function(pr){ Cani.core.on(pr, s3.init);});
    };

    Cani.core.on('config: s3', S3CONF);

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

    var reqBuff = {};

    s3.read = function(bucket, key){
	var def = Q.defer();
	var buck = bucket||s3conf.s3.Bucket;
	if(buck+' '+key in reqBuff) return reqBuff[buck+' '+key];
	sss[buck].getObject({Bucket: buck, Key: key}, function(err, data){
	    err? def.reject(err):def.resolve(data);
	    delete reqBuff[buck+' '+key];
	});
	reqBuff[buck+' '+key] = def.promise;
	return def.promise;	
    };

    return s3;

})(Cani.s3||{});
