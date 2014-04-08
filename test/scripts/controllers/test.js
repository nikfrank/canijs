'use strict';

angular.module('canijstest')
    .controller('TestCtrl', function ($scope) {

	var copy = function(t){return JSON.parse(JSON.stringify(t));};


	Cani.core.confirm('youtube').then(function(yt){
	    yt.search('lights techno').then(function(pon){
		console.log(pon);
console.log('http://img.youtube.com/vi/');
	    });
	});


//-------------------dynamo testing-------------------

	$scope.stypes = [{txt:'number',val:'S'},
			{txt:'string',val:'S'},
			{txt:'boolean',val:'B'}];

	$scope.types = [{txt:'number',val:'S'},
			{txt:'string',val:'S'},
			{txt:'boolean',val:'B'},
			{txt:'collection',val:'C'},
			{txt:'array',val:'A'}];

	$scope.push = function(d){
	    d.push({key:'',val:'', type:'S'});
	};

	$scope.pop = function(d){
	    d.pop();
	};

	$scope.doc = [];

	$scope.ldocs = [];

	$scope.dyAvail = false;

	Cani.core.confirm(['fb','dy']).then(function(pack){

	    $scope.schemas = pack.dy.schemas;
	    // by now we can load shit.

	    $scope.savedoc = function(){

		var query = {};

		for(var i=0; i<$scope.doc.length; ++i){
		    if(($scope.doc[i].type!=='C')&&($scope.doc[i].type!=='A')){
			query[$scope.doc[i].key] = $scope.doc[i].val;
		    }else if($scope.doc[i].type==='C'){
			var pack = {};
			for(var j=0; j<$scope.doc[i].val.length; ++j){
			    pack[$scope.doc[i].val[j].key] = $scope.doc[i].val[j].val;
			}
			query[$scope.doc[i].key] = pack;
		    }else if($scope.doc[i].type==='A'){
			var pack = [];
			for(var j=0; j<$scope.doc[i].val.length; ++j){
			    pack[j] = $scope.doc[i].val[j].val;
			}
			query[$scope.doc[i].key] = pack;
		    }
		}

		// pack the doc into a collection-query

		Cani.doc.save('lesson', query, {table:$scope.table||'docs'}).then(function(res){
		    console.log(res);
		});
	    };

	    $scope.loaddoc = function(){
		
		Cani.doc.load('lesson', {owner:''}, {table:$scope.table||'docs'}).then(function(docs){
		    var ldocs = [];
		    //make docs into an array
		    for(var i=0; i<docs.length; ++i){
			ldocs[i] = [];
			for(var ff in docs[i]){
			    // here guess the type
			    var type = (typeof docs[i][ff])[0].toUpperCase();
			    if(type === 'N') type = 'S';
			    if(type === 'O'){
				if(docs[i][ff].constructor == Array){
				    type = 'A';
				    for(var j=0; j<docs[i][ff].length; ++j){
					docs[i][ff][j] = {val:docs[i][ff][j], type:(typeof docs[i][ff][j])[0].toUpperCase()};
				    }
				}else{
				    type = 'C';
				    var cpack = [];
				    var ccc = 0;
				    for(var gg in docs[i][ff]){
					cpack[ccc++] = {val:docs[i][ff][gg], key:gg, type:(typeof docs[i][ff][gg])[0].toUpperCase()};
				    }
				    docs[i][ff] = cpack;
				}
			    }
			    
			    //if not an object or array...
			    ldocs[i][ldocs[i].length] = {key:ff, val:docs[i][ff], type:type};
			}
		    }

		    $scope.ldocs = copy(ldocs);
		    console.log($scope.ldocs);
		    $scope.$apply();
		});
	    };

	    $scope.dyAvail = true;
	    $scope.$apply();
	});

	$scope.erase = function(doc){
	    console.log(doc);
	    var did;
	    for(var i=0; i<doc.length; ++i) if(doc[i].key === 'docId') did = doc[i].val;
	    var own;
	    for(var i=0; i<doc.length; ++i) if(doc[i].key === 'owner') own = doc[i].val;

	    Cani.doc.erase('lesson', {docId:did, owner:own}, {table:$scope.table||'docs'}).then(function(res){
		console.log(res);
	    });
	};


	$scope.edit = function(docIndex){
	    $scope.docIndex = docIndex;
	    $scope.doc = copy($scope.ldocs[docIndex]);
	};

	$scope.$watch('doc', function(n, o){

	    if(!n) return;
	    for(var i=0; i<n.length; ++i){
		var tt = (typeof n[i].val)[0].toUpperCase();
		var nt = n[i].type;

		if(tt === 'N') tt = 'S';
		if((nt === 'C')||(nt === 'A')) nt = 'O';

		if(nt !== tt){
		    if(n[i].type === 'S') n[i].val = '';
		    else if(n[i].type === 'C') n[i].val = [];
		    else if(n[i].type === 'A') n[i].val = [];
		}
	    }
	}, true);

// s3 testing -----------------------------------------------

	Cani.core.confirm('s33').then(function(){

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
