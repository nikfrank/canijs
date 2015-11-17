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

		var fail = setTimeout(function(){
		    return done('notification callback flushed incorrectly');
		}, 2100);

		Cani.core.on('blah', function(asset){
		    if(blah !== asset) return done('asset not passed properly');
		    else if(++times === 2){
			clearTimeout(fail);
			return done(null);
		    }
		});

		Cani.core.cast('blah', false, blah);
		Cani.core.cast('blah', true, blah);
	    });
	});

	describe('on, flush', function(){
	    it('should call the callback properly when the notification is cast', function(done){
		
		var hmm = Math.random();
		var times = 0;

		var pass = setTimeout(function(){
		    return done(null);
		}, 1000);

		Cani.core.on('hmm', function(asset){
		    if(hmm !== asset){
			clearTimeout(pass);
			return done('asset not passed properly');
		    }
		    if(++times === 2){
			clearTimeout(pass);			
			return done('notification callback not flushed correctly');
		    }
		});

		Cani.core.cast('hmm', true, hmm);
		Cani.core.cast('hmm', true, hmm);

	    });
	});
    });

    describe('confirm', function(){
	describe('on, no flush', function(){
	    it('should stash the asset on affirm and resolve it on confirm', function(done){
		// do this test once for preregister, once for postregister

		var blah = Math.random();

		Cani.core.affirm('blah', blah);

		Cani.core.confirm('blah').then(function(asset){
		    if(blah !== asset) return done('asset not passed properly');
		    else return done(null);
		});

	    });
	});
    });

});
