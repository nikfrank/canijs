var assert = require('assert');

var AWS = require('aws-sdk');

var env = 'test';
var config = require('./unit-assets/config')[env];
var caniconfig = require('./unit-assets/Caniconfig');

var Cani = require('../cani');
Cani.dynamo = require('../cani-dynamo/cani-dynamo')(Cani, AWS)({});


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

write some crap to a table
write some crap with an array that has duplicates
 --> pare it down? or throw an error?
read that crap
read that crap with some operators
read crap with a limit
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

	before('should boot?', function(done){
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
		    Logins: {'cognito-identity.amazonaws.com': data.Token}
		});


		Cani.dynamo.init(caniconfig);
//{dynamo:{awsConfigPack:{region: 'eu-west-1'}}});

		Cani.core.confirm('dynamo.canijs-test').then(function(){
		    if(err){
			console.log(err, err.stack); // an error occurred
			return done(err);
		    }
		    else if(Cani.dynamo.tables.indexOf('canijs-test')===-1){
			return done('no access to test table'); // cant fire

		    }else return done(null, console.log(Cani.dynamo.tables));
		});

	    });
	});

	describe('write', function(){
	    it('writes without problems', function(done){

		Cani.dynamo.save('items', {uid:'blah', type:'shoe', price:100}).then(function(res){
		    console.log(res); // check that this === item
		    done(null);		    
		}, function(err){
		    done(err);
		});

	    });

	    it('reads without problems', function(done){

		Cani.dynamo.load('items', {uid:'blah'}).then(function(res){
		    console.log(res); // check that this === item
		    done(null);		    
		}, function(err){
		    done(err);
		});

	    });

/*

The sort key condition must use one of the following comparison operators:

a = b — true if the attribute a is equal to the value b
a < b — true if a is less than b
a <= b — true if a is less than or equal to b
a > b — true if a is greater than b
a >= b — true if a is greater than or equal to b
a BETWEEN b AND c — true if a is greater than or equal to b, and less than or equal to c.
The following function is also supported:

begins_with (a, substr)— true if the value of attribute a begins with a particular substring.

*/


	    it('reads using operators', function(done){

		Cani.dynamo.load('items', {uid:'blah'}).then(function(res){
		    console.log(res); // check that this === item
		    done(null);		    
		}, function(err){
		    done(err);
		});

	    });



// need to implement and test:
// filters, streams, pagination of results

/* take the LastEvaluatedKey value from the previous request, and use that value as the ExclusiveStartKey in the next request.*/

// strongly consistent reads

// conditional writes

/*
To request a conditional PutItem, DeleteItem, or UpdateItem, you specify the condition(s) in the ConditionExpression parameter. ConditionExpression is a string containing attribute names, conditional operators and built-in functions. The entire expression must evaluate to true; otherwise the operation will fail.

To write an item only if it doesn't already exist, use PutItem with a conditional expression that uses the attribute_not_exists function and the name of the table's partition key
*/


//atomic counters in updates


// updates
/*
http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.Modifying.html#Expressions.Modifying.UpdateExpressions.SET.IncrementAndDecrement
*/


// return values
/*
http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.Modifying.html#Expressions.Modifying.ReturnValues
*/


	});


    });
});

