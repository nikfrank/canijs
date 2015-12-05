// the aws regions need to be made consistent

module.exports = {

    s3:{
	Bucket:'bucket name from AWS S3',
	initOn:['cognito: fb-login']
    },

    cognito:{
	provider:'fb',
	IdentityPoolId:'POOL ID FROM AWS',
	AWSregion:'eu-west-1'
    },

    fb:{
	App:'651024351606699'
    },
    
    user:{
	fb:{
	    App:'651024351606699'
	},
	google:{
	    App:'234767639427-pfs0j8gj55lf28hl0193p69eg4dkhcva.apps.googleusercontent.com'
	},
	aws:{},
	noauth:{}
    },


    storage:{
	defCacheSize:127,
	defExpiryChunk:16,
	defExpirySort:function(f, s){
	    return (2*f.toString() > s.toString())-1;
	},
	cacheSize:{
	    pic:10,
	    swipe:255
	},
	expirySort:{
	    pic:function(f, s){
		return 2*(f.split('||')[1].split('.')[0] > s.split('||')[1].split('.')[0])-1;
	    },
	    swipe:function(f, s){
		return (2*f.toString() > s.toString())-1;
	    }
	},
	expiryChunk:{
	    pic:5,
	    swipe:32
	}
    },


// use this to make tables from AWS CLI?
    doc:{
	schemas:{
	    lesson:{
		fields:{// ie types
		    docType:'S',
		    owner:'S',
		    docId:'S'
		},
		defaults:{
		    owner:{user:'id'},
		    docType:'lesson'
		},
		saveDefaults:{
		    docId:{user:'id+date'},
		    owner:{user:'id'},
		    docType:'lesson'
		},
		tables:{
		    'docs':{
			arn:'arn:aws:dynamodb:us-west-2:735148112467:table/docs',
			hashKey:'owner',
			rangeKey:'docId',
			indices:['docType-owner-index','owner-docType-index'],
			requiredFields:[]
		    },
		    'private':{
			arn:'arn:aws:dynamodb:us-west-2:735148112467:table/private',
			hashKey:'owner',
			rangeKey:'docId',
			indices:['owner-docType-index'],
			requiredFields:[]
		    }
		},
		stringifyAllArrays: false,
		authOrder:['fb','google']
	    }
	},
	awsConfigPack:{region:'us-west-2'},
	IAMRoles:{
	    noauth:'arn:aws:iam::735148112467:role/canijstest',
	    fb:'arn:aws:iam::735148112467:role/canijstest',
	    google:'arn:aws:iam::735148112467:role/canijstestgoogle'
	}
    },

    dynamo:{
	schemas:{
	    items:{
		fields:{
		    uid:'S',
		    type:'S',
		    price:'N'
		},
		table:{
		    arn:'arn:aws:dynamodb:eu-west-1:735148112467:table/canijs-test',
		    hashKey:'uid',
		    rangeKey:'type',
		    indices:['type-price-index']
		}
	    }
	},
	awsConfigPack:{region: 'eu-west-1'},
	initOn:[]
    },

    file:{
	schemas:{'default':'canijs-test'},
	IAMRoles:{
	    noauth:'arn:aws:iam::735148112467:role/canijstest',
	    fb:'arn:aws:iam::735148112467:role/canijs-test-s3'
	}
    },

    indexeddb:{
	idbname:'idbtest',
	idbversion:5,
// all these schemae need are key path options and indices.

	schemas:{
	    links:{
		keyPath:'link_hash',
		indices:{person_hash:{unique:false},
			 places:{unique:false, multiEntry:true},
			 last_seen:{unique:false}
			},
		fields:{
		    // any data conversion on upgrade needed should be codified here.
		    // ie last_seen:{2:'last', 1:{tag:'last', map:function}}
		},
		defaults:{
		    // this is searching defaults
		},
		saveDefaults:{
		    last_seen:'now()'
		    // use this with cani-user to save self-data
		}
	    },

	    msgs:{
		keyPath:'msg_hash',
		indices:{from:{unique:false},
			 to:{unique:false, multiEntry:true},
			 sent:{unique:false}
			},
		fields:{
		    // any data conversion on upgrade needed should be codified here.
		    // ie last_seen:{2:'last', 1:{tag:'last', map:function}}
		},
		defaults:{
		    // this is searching defaults
		},
		saveDefaults:{
		    // use this with cani-user to save self-data
		}
	    }

	}
    }
};
