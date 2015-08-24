'use strict';

Cani.core.confirm('cognito').then(function(){
    Cani.core.confirm('fb: login')
	.then(function(loginData){return {authResponse:loginData};})
	.then(Cani.cognito.onLogin)
	.then(function(cogId){
	    window.cogId = cogId;
	});
});

window.upload = window.read = function(){
    console.log('Chill your balls! Cani dynamo not yet ready');
};


Cani.core.confirm('dynamo').then(function(){
    // by now, window.cogId = {IdentityId: "aws-region:00000000-0000-0000-0000-000000000000"}

    window.read = function(){
	Cani.dynamo.load('item', {owner:window.cogId.IdentityId}).then(function(items){
console.log('res',items);
	    var itemHTML = '';
	    for(var i=0; i<items.length; ++i) itemHTML += '<li>'+items[i]+'</li>';
	    document.getElementById('item-table').innerHTML = itemHTML;
	});
    };

    window.upload = function(){
	var nuItem = {
	    owner:window.cogId.IdentityId,
	    item:document.getElementById('nuItem').value,
	    due:new Date(document.getElementById('nuDate').value).getTime(),
	    refUrls:[1,2,3].map(function(r){return document.getElementById('nuRef'+r).value}).filter(Boolean)
	};

	Cani.dynamo.save('item', nuItem).then(function(success){
	    console.log('success!', JSON.stringify(success),'now refresh the table to see the item!');

	}, function(err){
	    console.log('there was an error',JSON.stringify(err));
	});
    };

});
