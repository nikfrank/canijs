'use strict';

angular.module('canijstest')
    .controller('TestCtrl', function ($scope) {

	$scope.push = function(d){
	    d.push({key:'',val:''});
	};

	$scope.pop = function(d){
	    d.pop();
	};

	$scope.doc = [];
	$scope.docType = '';

	$scope.dyAvail = false;

	Cani.confirm('db.dy').then(function(){

	    $scope.dyAvail = true;

	    $scope.savedoc = function(){
		Cani.save($scope.docType, $scope.doc);
	    };
	});

	$scope.ldoc = [];

	$scope.loaddoc = function(query){
	    Cani.load(query).then(function(docs){
		$scope.ldoc = docs;
		console.log($scope.ldoc);
		$scope.$apply();
	    });
	};

});
