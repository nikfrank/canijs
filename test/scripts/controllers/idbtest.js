'use strict';

angular.module('canijstest')
  .controller('IdbtestCtrl', function ($scope) {

      // run tests on the idb singleton?

console.log('waiting...');

      Cani.core.confirm('idb').then(function(idb){
	  console.log('confirmed', idb);
      });

});
