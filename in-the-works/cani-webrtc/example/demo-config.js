// the aws regions need to be made consistent

Cani.core.boot({

    cognito:{
	provider:'fb',
	IdentityPoolId:'POOL ID FROM AWS',
	AWSregion:'eu-west-1'
    },

    fb:{
	App:'651024351606699'
    },
    
// need to make a new table to use as a signaller
    dynamo:{
	schemas:{
	    appt:{
		fields:{
		    geohash:'S',
		    expiry:'N',
		    owner:'S',
		    price:'N'
		},
		table:{
		    arn:'arn:aws:dynamodb:eu-west-1:735148112467:table/canijs-signal',
		    hashKey:'ice',
		    rangeKey:'expiry',
		    indices:[]
		}
	    }
	},
	awsConfigPack:{region: 'eu-west-1'},
	initOn:['cognito: fb-login', 'cognito: gg-login']
    }
});
