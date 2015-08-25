'use strict';

Cani.core.confirm('cognito').then(function(){
    Cani.core.confirm('fb: login')
	.then(function(loginData){return {authResponse:loginData};})
	.then(Cani.cognito.onLogin)
	.then(function(cogId){window.cogId = cogId;
			      window.cHash = cogId.IdentityId.replace(/[^A-Fa-f0-9]/g,'')});
});

window.upload = window.read = window.list = function(){console.log('Cani S3 not yet ready');};

Cani.core.confirm('s3').then(function(){
    window.list = function(){
	Cani.s3.list('canijs').then(function(im){
	    var us = {};
	    for(var a,j=im.length;j-->0;) us[(a=im[j].Key.split('/')[0])] = (us[a]||[]).concat(im[j]);
	    window.users = us;
	    document.getElementById('user-list').innerHTML = Object.keys(us).reduce(function(p,c){
		return p+'<li onclick="pickUser(\''+c+'\')"><img src="//gravatar.com/avatar/'+
		    window.cHash+'?d=wavatar"> - '+us[c].length+'</li>';},'');
	});
    };

    window.read = function(keys){
	Cani.s3.read('canijs', keys).then(function(im){
	    var imgs = im.map(function(t){return JSON.parse(String.fromCharCode.apply(null, t.Body))});

	    var itemHTML = imgs.reduce(function(p,c){
		return p+'<li><img src="'+c.data+'">'+c.comment+'</li>';},'');
	    document.getElementById('img-contain').innerHTML = itemHTML;
	});
    };

    window.pickUser = function(hash){
	if(window.user === hash) return;
	window.read(window.users[window.user = hash].map(function(o){return o.Key}));
    };

    window.upload = function(pic, comment){
	var nuItem = {data:pic, comment:comment};
	var nuKey = window.cogId.IdentityId+'/'+(new Date).getTime()+'.json';

	return Cani.s3.upload('canijs', nuKey, nuItem).then(function(success){
	    console.log('success!',JSON.stringify(success),'\nnow refresh the table to see the item!');
	}, function(err){console.log('there was an error',err);});
    };
});

/////////////////////////////
// file reader & dom stuff //
/////////////////////////////

function getFile(){
    var d = document.createElement('div');
    var i = document.createElement('input');
    i.type = 'file';

    document.body.appendChild(d);
    d.className = 'upload-box'; d.setAttribute('layout', 'row');
    d.appendChild(i);

    i.addEventListener('change', function(e) {
	var file = i.files[0];
	var reader = new FileReader();

	reader.onloadend = function(e){
	    d.removeChild(i);
	    window.currentPic = reader.result;

	    var m = document.createElement('img');
	    m.src = window.currentPic;
	    d.appendChild(m);

	    var t = document.createElement('textarea');
	    t.placeholder = 'Caption your picture!';
	    d.appendChild(t);

	    var b = document.createElement('button'); b.innerText = 'Done';
	    b.onclick = function(){
		window.currentComment = document.getElementsByTagName('textarea')[0].value;
		while(d.firstChild) d.removeChild(d.firstChild);

		var m = document.createElement('img');
		m.src = 'https://media.giphy.com/media/12kGB0hjXATilW/giphy.gif';
		m.style.margin='auto';
		d.appendChild(m);

		window.upload(window.currentPic, window.currentComment).fin(function(){
		    document.body.removeChild(d);
		});
	    };
	    d.appendChild(b);
	};
	reader.readAsDataURL(file);
    });
}
