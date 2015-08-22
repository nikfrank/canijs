Cani.core.boot({
    cognito:{
	provider:'fb',
	IdentityPoolId:'POOL ID FROM AWS',
	AWSregion:'eu-west-1'
    },

    fb:{
	App:'App id from developers.facebook.com'
    },

    dynamo:{
	schemas:{ // set this to an actual table, test, then remove the ARN data.
	    item:{
		fields:{geohash:'S', expiry:'N', owner:'S', price:'N'},
		table:{
		    arn:'arn:aws:dynamodb:eu-west-1:735148112467:table/dre',
		    hashKey:'expiry', rangeKey:'geohash', indices:[]
		}
	    }
	},
	awsConfigPack:{region: 'eu-west-1'},
	initOn:['cognito: fb-login']
    }
});
