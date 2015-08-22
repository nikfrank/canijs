Cani.core.boot({
    cognito:{
	provider:'fb',
	IdentityPoolId:'POOL ID FROM AWS',
	AWSregion:'eu-west-1'
    },

    fb:{
	App:'App id from developers.facebook.com'
    }
});
