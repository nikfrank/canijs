var assert = require('assert');

var AWS = require('aws-sdk');

var env = 'test';
var config = require('./unit-assets/config')[env];
var caniconfig = require('./unit-assets/Caniconfig');

var Cani = require('../cani');
var dynamo = require('../cani-dynamo/cani-dynamo')(Cani, AWS)({});


// duplicate this for each module, pack the tests into the modules
// automate the testing of all of them?

var teststatus = '';

var tdata = require('./unit-assets/testdata');

var secrets;

try{
    secrets = require('secret/aws-keys');
}catch(e){
    secrets = {accessKeyId:process.env.accessKeyId, secretAccessKey:process.env.secretAccessKey};
}


describe('cani', function(){

    before(function(done){
	Cani.core.boot(caniconfig);
	done(null);
    });


/*
need to test:

auth from .gitignored file AND send that shit to travis CI properly
write some crap to a table
read that crap
read that crap with some operators
read that crap from some JSON fields or whatever
read that crap from a GSI or two
update it
read it again
delete it
read and make sure it's gone

//

I could facade the aws singleton and check that the params are right to the calls
but what the fuck kind of testing would that be?

this shit has to run on the actual dynamoDB
if that shit changes, the sdk version has to be parametrized and versioning coded for.


*/
    describe('dynamo', function(){

	describe('init', function(){
	    it('should boot?', function(done){
		this.timeout(5000);
		
		AWS.config.update(secrets);
		AWS.config.update({region: 'eu-west-1'});
		var cognitoidentity = new AWS.CognitoIdentity(); // options?

		var params = {
		    IdentityPoolId:'eu-west-1:c5b3e48a-d5df-4ea3-bb42-91404d7c2248',
		    Logins:{canijs:'travis-ci-test-account'},
		    IdentityId:null,// null because id is handled by logins map
		    TokenDuration:864 // a hundredth of a day
		};

		cognitoidentity.getOpenIdTokenForDeveloperIdentity(params, function(err, data) {

		    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
			IdentityPoolId: 'eu-west-1:c5b3e48a-d5df-4ea3-bb42-91404d7c2248',
			IdentityId: data.IdentityId,
			Logins: {
			    'cognito-identity.amazonaws.com': data.Token
			}
		    });

		    Cani.core.cast('config: dynamo', {
			dynamo:{
			    awsConfigPack:{region: 'eu-west-1'}
			}
		    });

		    var dy = new AWS.DynamoDB();

		    dy.listTables(function(err, tables){

			if(err){
			    console.log(err, err.stack); // an error occurred
			    return done(err);
			}
			else if(tables.TableNames.indexOf('canijs')===-1){
			    return done('no access to test table');
			}else{
			    return done(null, console.log(tables));
			}
		    });
		});

	    });
	});
    });
});

