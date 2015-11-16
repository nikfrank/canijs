var assert = require('assert');

var aws = require('aws-sdk');

var env = 'test';
var config = require('./config')[env];
var caniconfig = require('./Caniconfig');

var Cani = require('../cani');


// duplicate this for each module, pack the tests into the modules
// automate the testing of all of them?

var teststatus = '';

var tdata = require('./testdata');

describe('cani', function(){

    before(function(done){
	Cani.core.boot(caniconfig);
	done(null);
    });


/*

need to test:
cast
on
affirm
defirm
confirm

*/
    describe('cast', function(){
	describe('on, no flush', function(){
	    it('should call the callback properly when the notification is cast', function(done){
		
		var blah = Math.random();
		var times = 0;

		Cani.core.on('blah', function(asset){
		    if(blah !== asset) return done('asset not passed properly');
		    if(++times === 2) done(null);
		});


		Cani.core.cast('blah', false, blah);
		Cani.core.cast('blah', false, blah);

		setTimeout(function(){
		    return done('notification callback flushed incorrectly');
		}, 2900);

	    });
	});

	describe('on, flush', function(){
	    it('should call the callback properly when the notification is cast', function(done){
		
		var hmm = Math.random();
		var times = 0;

		Cani.core.on('hmm', function(asset){
		    if(hmm !== asset) return done('asset not passed properly');
		    if(++times === 2) return done('notification callback not flushed correctly');
		});

		Cani.core.cast('hmm', true, hmm);
		Cani.core.cast('hmm', true, hmm);

		setTimeout(function(){
		    return done(null);
		}, 1000);

	    });
	});
    });

});
