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

	    $scope.savedoc = function(options){

		for(var i=0; i<$scope.doc.length; ++i){
		    if($scope.doc[i].key === 'docType') $scope.docType = $scope.doc[i].val;
		}

		Cani.save.doc({docType:$scope.docType, overwrite:options.overwrite, privacy:options.privacy}, $scope.doc).then(function(res){
		    console.log(res);
		});
	    };
	});

	$scope.ldocs = [];

	$scope.loaddoc = function(options){
	    Cani.load.doc(options).then(function(docs){

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

// s3 testing -----------------------------------------------

	Cani.confirm('db.s3').then(function(){
	    console.log('db.s3 confirm');

	    $scope.savefile = function(inputselector){

		if(!inputselector){
		    // grab the text from the textarea and make a file out of it
		    var textFile = null;
		    var makeTextFile = function (text) {
			var data = new Blob([text], {type: 'text/plain'});

			// If we are replacing a previously generated file we need to
			// manually revoke the object URL to avoid memory leaks.
			if (textFile !== null) {
			    window.URL.revokeObjectURL(textFile);
			}

			textFile = window.URL.createObjectURL(data);

			return textFile;
		    };

		    //textFile = makeTextFile();

		    Cani.save.file('S', document.getElementById('filearea').value);
		}else{

		    // grab the file from the html input at inputselector
		    var file = document.getElementById(inputselector).files[0];

		    console.log(file);

		    if(file){
			Cani.save.file('F',file);
		    }
		}
	    };

	    $scope.loadfilelist = function(){
		// grab the file list from the s3
		Cani.load.fileList();
	    };
	});


});
