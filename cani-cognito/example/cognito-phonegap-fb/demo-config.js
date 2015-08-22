Cani.core.boot({
    cognito:{
	provider:'fb',
	IdentityPoolId:'POOL ID FROM AWS',
	AWSregion:'eu-west-1'
    }

    // the phonegapFb plugin signs in using the key hash
});
