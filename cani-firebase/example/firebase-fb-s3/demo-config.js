Cani.core.boot({
    cognito:{
	provider:'fb',
	IdentityPoolId:'eu-west-1:c5b3e48a-d5df-4ea3-bb42-91404d7c2248',
	AWSregion:'eu-west-1'
    },

    fb:{
	App:'492663127567107'
    },

    firebase:{
	url:'https://dazzling-fire-4932.firebaseIO.com',
	initOn:['fb: login']
    }
});
