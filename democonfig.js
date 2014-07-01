Cani.core.boot({

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

    doc:{
	schemas:{ // use this to make tables from AWS CLI?
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
	awsConfigPack:{region: 'us-west-2'},
	IAMRoles:{
	    noauth:'arn:aws:iam::735148112467:role/canijstest',
	    fb:'arn:aws:iam::735148112467:role/canijstest',
	    google:'arn:aws:iam::735148112467:role/canijstestgoogle'
	}
    },

    file:{
	schemas:{'default':'canijs-test'},
	IAMRoles:{
	    noauth:'arn:aws:iam::735148112467:role/canijstest',
	    fb:'arn:aws:iam::735148112467:role/caijs-test-s3'
	}
    },

    indexeddb:{
	schemas:{
	    links:{
		fields:{

// all these schemae need are key path options and indices.
// any data conversion on upgrade needed should be codified here.
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
		}
	    }
	}
    }
});
