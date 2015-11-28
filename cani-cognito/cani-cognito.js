Cani.cognito = (function(cognito){
    var cog;
    var COGCONF = function(conf){
	cognito.onLogin = function(providerResponse){
	    var def = Q.defer();
	    
// generalize this per provider in conf

// also this will have to be able to handle multiple concurrent identities
// eg: I want to lambda with google ID, then dyanmo withe facebook login.
// and the cognito data syncing feature.

// work out long term token storage
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
	    var cp = JSON.parse(JSON.stringify(credPack));


	    AWS.config.region = conf.cognito.AWSregion;
	    AWS.config.credentials = new AWS.CognitoIdentityCredentials(credPack);

	    cog = new AWS.CognitoIdentity();
	    cog.getCredentialsForIdentity({
		IdentityId:credPack.IdentityId,
		Logins:Logins
	    }, function(err, creds){
		cog.getId(cp, function(err, data){
		    if(err) console.log('cog err', err);
		    else def.resolve(data);
		    
		    Cani.core.affirm('cognito: fb-login', data);
		});
	    });

	    return def.promise;
	};

	Cani.core.affirm('cognito', cognito);
    };

    Cani.core.on('config: cognito', COGCONF);    

    return cognito;
})(Cani.cognito||{});
