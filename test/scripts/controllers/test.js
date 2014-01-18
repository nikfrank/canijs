'use strict';

angular.module('canijstest')
    .controller('TestCtrl', function ($scope) {

	$scope.doc = [];
	$scope.docType = '';

	$scope.push = function(d){
	    d.push({key:'',val:''});
	};

	$scope.pop = function(d){
	    d.pop();
	};

	$scope.savedoc = function(){
	    Cani.save($scope.docType, $scope.doc);
	};
	
	$scope.loaddoc = function(query){
	    Cani.load(query);
	};

});
