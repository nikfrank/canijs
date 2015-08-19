Cani.sns = (function(sns){

// we've assumed the aws js sdk is loaded in the index file
// this could be moved into a module and confirmed for consistency a la
//    Cani.core.on('aws', function(conf){ CONF(conf);} );

    var sno; // aws sns singleton

    // ------------------------------- config -------------------------------------
    var SNSCONF = function(conf, provider){ //provider =<= ['fb', 'google', ('aws')]

	if(provider === 'noauth') return; // idk about this here...

	var webCredPack = {
	    RoleArn: conf.sns.IAMRoles[provider],    //conf[provider].IAMRoles['db.dy'],
	    WebIdentityToken: Cani.user[provider].accessToken //check this for no auth setup
	};

	if(provider === 'fb') webCredPack.ProviderId = 'graph.facebook.com';
	AWS.config.credentials = new AWS.WebIdentityCredentials(webCredPack);
	
	sno = new AWS.SNS();
	
	sno.getEndpointAttributes(params, function (err, data) {
	    if (err){
		console.log(err, err.stack); // an error occurred
	    }else{
		console.log(data); // successful response
	    }
	});

    };

    // dynamo boot hook
    Cani.core.on('config: sns noauth', function(conf){
	SNSCONF(conf, 'noauth');
	Cani.core.confirm('fb').then(function(user){ SNSCONF(conf, 'fb');} );
	Cani.core.confirm('google').then(function(user){ SNSCONF(conf, 'google');} );
    } );




    return sns;

})(Cani.sns||{});
