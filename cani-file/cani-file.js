if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

Cani.file = (function(file){
    // expect schemas in conf.file to map saves/loads, confirm permissions properly

    var s3; // aws s3 singleton

    // run this right away with noauth
    // then on the provider casts run 

    var S3CONF = function(conf, provider){

	s3 = new AWS.S3({params: {Bucket: conf.file.schemas['default'] } });
	s3.Bucket = conf.file.schemas['default'];
	
	var bucketCredPack = {
            RoleArn: conf.file.IAMRoles[provider],
            WebIdentityToken: Cani.user[provider].accessToken
        };
	if(provider === 'fb') bucketCredPack.ProviderId = 'graph.facebook.com';
	s3.config.credentials = new AWS.WebIdentityCredentials(bucketCredPack);

	// is there a list available buckets function? idk
	Cani.core.cast('s3', true);
    };

    Cani.core.on('config: file noauth', function(conf){ S3CONF(conf, 'noauth');} );
    Cani.core.on('fb', function(conf){ S3CONF(conf, 'fb');} );
    Cani.core.on('google', function(conf){ S3CONF(conf, 'google');} );


    // expose save and load functions

    return file;

})(Cani.file||{});



try{
//------------data-s3 module
    cc.save.file = function(query,file){
	// this is for db.s3 only

	var objKey = 'fb||' + user.fb.profile.id + '/' + file.name;
	if(query === 'F'){
            var params = {Key: objKey, ContentType: file.type, Body: file, ACL: 'public-read'};
	}else if(query === 'S'){
	    var params = {Key: objKey, ContentType: 'text/plain', Body: file, ACL: 'public-read'};
	}

        db.s3.putObject(params, function (err, data) {
            if (err) {
		console.log('err');
                console.log(err);
            } else {
		console.log(data);
            }

        });

    };

    cc.load.fileList = function(query, index){
	// load the file list from the bucket
	db.s3.listObjects({Bucket:db.s3.Bucket}, function(err, res){
	    console.log(res);
	});
    };

    cc.load.file = function(query, index){
	// this is for loading s3 files without db.dy indices... Key is the name of the file(?)
	db.s3.getObject({Bucket:db.s3.Bucket, Key:index}, function(err, res){
	    console.log(res);
	});
    };
//-------------end data-s3 module


}catch(e){

console.log(e);

}
