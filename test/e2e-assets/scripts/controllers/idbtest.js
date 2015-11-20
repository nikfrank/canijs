'use strict';

angular.module('canijstest')
  .controller('IdbtestCtrl', function ($scope) {

      // run tests on the idb singleton?

      console.log('waiting...');

      Cani.core.confirm('idb').then(function(idb){
	  console.log('confirmed', idb);

	  $scope.load = idb.load;
	  $scope.save = idb.save;


	  // gen msg hash, insert msgs, then load them back

	  $scope.numsg = function(text){
	      var msg = {from:'',to:'',sent:(new Date()), text:text, msg_hash:(new Date())};

	      idb.save('msgs', msg).then(function(res){
		  console.log(res);
	      });
	  };

	  $scope.loadmsg = function(){
	      idb.load('msgs').then(function(res){
		  console.log(res);
	      });
	  };


      });

      Cani.core.confirm('fbgraph').then(function(fbgraph){

	  $scope.fbtest = function(){
	      fbgraph.searchPages().then(function(res){
		  console.log(res);
	      });
	  };
      });

});
