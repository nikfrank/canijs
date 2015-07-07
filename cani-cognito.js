if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

Cani.cognito = (function(cognito){

    var cog;

    var COGCONF = function(conf){
	console.log('cogConf');

	cognito.onLogin = function(providerResponse){
	    var def = Q.defer();
	    
// generalize this per provider in conf
	    var accessToken;
	    if(conf.cognito.provider === 'fb')
		accessToken = providerResponse.authResponse.accessToken;

	    var Logins;
	    if(conf.cognito.provider === 'fb')
		Logins = {'graph.facebook.com': accessToken};

	    var credPack = {
		IdentityPoolId: conf.cognito.IdentityPoolId,
		Logins:Logins
	    };


	    AWS.config.region = conf.cognito.AWSregion;
	    AWS.config.credentials = new AWS.CognitoIdentityCredentials(credPack);

	    cog = new AWS.CognitoIdentity();

	    cog.getId(credPack, function(err, data){
		err?
		    console.log('cog err', err):
		    def.resolve(data);
	    });

	    return def.promise;
	};

	Cani.core.affirm('cognito', cognito);
    };


    Cani.core.on('config: cognito', COGCONF);    

    return cognito;
})(Cani.cognito||{});
