Cani.core.boot({
    cognito:{
	provider:'fb',
	IdentityPoolId:'eu-west-1:c5b3e48a-d5df-4ea3-bb42-91404d7c2248',
	AWSregion:'eu-west-1'
    },

    fb:{
	App:'492663127567107'
    },

    dynamo:{
	schemas:{
	    item:{
		fields:{owner:'S', due:'N', item:'S', refUrls:'SS'},
		table:{
		    arn:'arn:aws:dynamodb:eu-west-1:735148112467:table/canijs',
		    reservedAttributes:['owner'],
		    hashKey:'owner', rangeKey:'due', indices:[]
		}
	    }
	},
	awsConfigPack:{region: 'eu-west-1'},
	initOn:['cognito: fb-login']
    }
});
