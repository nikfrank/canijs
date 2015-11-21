var assert = require('assert');

var aws = require('aws-sdk');

var env = 'test';
var config = require('./unit-assets/config')[env];
var caniconfig = require('./unit-assets/Caniconfig');

var Cani = require('../cani');
var dynamo = require('../cani-dynamo/cani-dynamo')(Cani)({});


// duplicate this for each module, pack the tests into the modules
// automate the testing of all of them?

var teststatus = '';

var tdata = require('./unit-assets/testdata');

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
console.log(process.env);

		if(('blah' in process.env)&&('hmm' in process.env)) done(null);
		else done('no secret nev vars');
	    });
	});
    });
});

