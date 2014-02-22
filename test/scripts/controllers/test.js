'use strict';

angular.module('canijstest')
    .controller('TestCtrl', function ($scope) {

	var copy = function(t){return JSON.parse(JSON.stringify(t));};

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

		for(var i=0; i<$scope.doc.length; ++i){
		    if($scope.doc[i].key === 'docType') $scope.docType = $scope.doc[i].val;
		}
console.log($scope.doc);

		Cani.save({docType:$scope.docType, overwrite:false}, $scope.doc, privacy).then(function(res){
		    console.log(res);
		});
	    };
	});

	$scope.ldocs = [];

	$scope.loaddoc = function(query){
	    Cani.load(query).then(function(docs){

		var ldocs = [];
		//make docs into an array
		for(var i=0; i<docs.length; ++i){
		    ldocs[i] = [];
		    for(var ff in docs[i]){
			ldocs[i][ldocs[i].length] = {key:ff, val:docs[i][ff]};
		    }
		}

		$scope.ldocs = copy(ldocs);
		console.log($scope.ldocs);
		$scope.$apply();
	    });
	};

	$scope.edit = function(doc){
	    $scope.doc = doc;
	    $scope.docType = doc.docType;
	};

});
