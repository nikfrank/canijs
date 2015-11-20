var assert = require('assert');

var aws = require('aws-sdk');

var env = 'test';
var config = require('./unit-assets/config')[env];
var caniconfig = require('./unit-assets/Caniconfig');

var Cani = require('../cani');


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

	describe('cast regex', function(){
	    it('should cast for only the assets remaining', function(done){

		var blah = Math.random();

		Cani.core.on('2342342rawr234234', function(asset){
		    if(asset !== blah) return done('asset not killed properly');
		    else return done(null);
		});

		Cani.core.cast(/rawr/, true, blah);
	    });
	});
    });

    describe('confirm', function(){
	describe('on, no flush', function(){
	    it('should stash the asset on affirm and resolve it on confirm', function(done){

		var blah = Math.random();

		Cani.core.affirm('blah1', blah);

		Cani.core.confirm('blah1').then(function(asset){
		    if(blah !== asset) return done('asset not passed properly');
		    else return done(null);
		});

	    });

	    it('should wait for affirm to confirm', function(done){
		var blah = Math.random();

		Cani.core.confirm('blah2').then(function(asset){
		    if(blah !== asset) return done('asset not passed properly');
		    else return done(null);
		});

		Cani.core.affirm('blah2', blah);
	    });

	    it('should confirm the array of assets', function(done){
		var blah = Math.random();
		var hmm = Math.random();

		Cani.core.confirm(['blah3','blah4']).then(function(assets){
		    if((assets.blah3 !== blah)||(assets.blah4 !== hmm))
			return done('asset not passed properly');
		    else return done(null);
		});

		Cani.core.affirm('blah3', blah);
		Cani.core.affirm('blah4', hmm);
	    });


	    it('should confirm the hash of assets', function(done){
		var blah = Math.random();
		var hmm = Math.random();

		Cani.core.confirm({blah6:'',blah7:''}).then(function(assets){
		    if((assets.blah6 !== blah)||(assets.blah7 !== hmm))
			return done('asset not passed properly');
		    else return done(null);
		});

		Cani.core.affirm('blah6', blah);
		Cani.core.affirm('blah7', hmm);
	    });


	    it('should disconfirm the asset on defirm', function(done){
		var blah = Math.random();

		Cani.core.affirm('blah5', blah);

		Cani.core.confirm('blah5').then(function(asset){
		    Cani.core.disconfirm('blah5').then(function(noasset){
			if(noasset === blah) return done('asset not killed properly');
			else return done(null);
		    });
		    Cani.core.defirm('blah5');
		});

	    });

	});
    });

});
