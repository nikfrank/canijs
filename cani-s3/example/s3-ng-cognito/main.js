'use strict';

angular.module('s3demo', ['ui.router']).run(function($q){ window.Q = $q; })

.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise("/");

    $stateProvider.state('login', {
	url: "/",
	templateUrl: "views/login.html",
	controller: 'LoginCtrl as login'

    }).state('main', {
	url: "/main",
	templateUrl: "views/main.html",
	controller: 'MainCtrl as ctrl',
	resolve:{
	    CaniDep:function(auth){ // this DI is what triggers login on refresh from #/main
		console.log('confirming...');
		return Cani.core.confirm(['cognito: fb-login', 's3']);
	    }
	}
    });
})

.service('auth', function(){
    var that = this;
    this.confirmLogin = Cani.core.confirm('cognito').then(function(){
	Cani.core.confirm('fb: login')
	    .then(function(loginData){return {authResponse:loginData};})
	    .then(Cani.cognito.onLogin)
	    .then(function(cogId){
		return that.cogId = cogId;
	    });
    });
})

.controller('LoginCtrl', function(auth, $state){ // this DI is what triggers login from new page load
    auth.confirmLogin().then(function(cogId){
	$state.go('main');
    });

})

.controller('MainCtrl', function(){
    var that = this;

    this.list = function(){
	Cani.s3.list('canijs').then(function(items){
	    // bin the items (objs describing file) by their user cognito hash (=s3 item prefix)
	    var users = {};
	    for(var a,j=items.length;j-->0;) // thisd be a great R exercise "binBy"
		users[(a=items[j].Key.split('/')[0])] = (users[a]||[]).concat(items[j]);
	    return users;

	}).then(function(users){
	    that.users = users;
	    that.userHashes = Object.keys(users);
	});
    };

    this.readImgs = function(keys){
	return Cani.s3.read('canijs', keys).then(function(items){
	    return items.map(function(t){
		return JSON.parse(String.fromCharCode.apply(null, t.Body));
	    });
	});
    };

    this.pickUser = function(hash){
	if(that.user === hash) return;

	return that.readImgs(that.users[hash].map(R.prop('Key'))).then(function(imgs){
	    that.user = hash;
	    that.imgs = imgs;
	});
    };

    this.gravatarUrl = function(hash){
	return '//gravatar.com/avatar/'+hash.replace(/[^A-Fa-f0-9]/g,'')+'?d=wavatar';
    };

    this.gettingFile = false;
})

.directive('getFile', function(){
    return {
	templateUrl:'views/get-file.html',
	scope:{doneGettingFile:'&getFile'},
	controllerAs:'gtf',
	controller:function($scope, $element, auth){

	    var that = this;

	    var upload = function(pic, comment){
		var nuItem = {data:pic, comment:comment};
		var nuKey = auth.cogId.IdentityId+'/'+(new Date).getTime()+'.json';

		// return the promise so when it's done getfile (who called this) can close the dialog
		return Cani.s3.upload('canijs', nuKey, nuItem).then(function(success){
		    console.log('success!', JSON.stringify(success), '\nhit refresh to see the item!');
		}, function(err){
		    console.log('there was an error', err);
		});
	    };


	    this.hasFile = false;
	    this.uploading = false;

	    var i = $element.find('input')[0];
	    
	    i.addEventListener('change', function(e){
		that.hasFile = true;
		var file = i.files[0];
		var reader = new FileReader();

		reader.onloadend = function(e){
		    that.currentPic = reader.result;

		    that.done = function(){
			that.uploading = true;

			upload(that.currentPic, that.currentComment).then(function(){
			    that.uploading = false;
			    $scope.doneGettingFile();
			});
		    };
		    $scope.$digest();
		};
		reader.readAsDataURL(file);
		$scope.$digest();
	    });
	}
    };
});
