'use strict';

Cani.core.confirm('cognito').then(function(){
    Cani.core.confirm('fb: login')
	.then(function(loginData){return {authResponse:loginData};})
	.then(Cani.cognito.onLogin);
});

window.write = window.read = function(){
    console.log('Chill your balls! Cani dynamo not yet ready');
};

Cani.core.confirm('s3').then(function(){

    window.read = function(){
	Cani.s3.read('', {}) // fill this in
	    .then(function(items){
		var itemHTML = '';
		for(var i=0; i<items.length; ++i) itemHTML += '<li>'+item+'</li>';
		document.getElementById('item-table').innerHTML = itemHTML;
	    });
    };

    window.write = function(){
	var nuItem = {}; // fill this in

	Cani.s3.upload('item', nuItem)
	    .then(function(success){
		alert('success! '+JSON.stringify(success)+'\nnow refresh the table to see the item!');

	    }, function(err){
		alert('there was an error: '+JSON.stringify(err));
	    });
    };

});
