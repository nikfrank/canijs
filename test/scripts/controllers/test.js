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

	    $scope.savedoc = function(privacy){
		Cani.save({docType:$scope.docType, overwrite:false}, $scope.doc, privacy).then(function(res){
		    console.log(res);
		});
	    };
	});

	$scope.ldocs = [];

	$scope.loaddoc = function(query){
	    Cani.load(query).then(function(docs){
		$scope.ldocs = docs;
		console.log($scope.ldocs);
		$scope.$apply();
	    });
	};

	$scope.edit = function(doc){
	    $scope.doc = doc;
	    $scope.docType = doc.docType;
	};

});
