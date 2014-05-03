if(typeof window['Cani'] === 'undefined'){
    console.log('what?');
}else{
    console.log(Cani);
}

Cani.rtc = (function(rtc){

    var socket = io.connect('http://localhost:8500');

    var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
    var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;

    var server = {
	iceServers: [
            {url: "stun:23.21.150.121"},
            {url: "stun:stun.l.google.com:19302"}
	]
    };

    var options = {
	optional: [
            {DtlsSrtpKeyAgreement: true},
            {RtpDataChannels: true}
	]
    };

    var pc = new PeerConnection(server, options);

    var dataChannel;


    // ondatachannel (datachannel) -> set handlers
    console.log('create ondatachannel handler');
    pc.ondatachannel = function(datachannel){
	console.log('datachan');
	console.log(datachannel);
	dataChannel = datachannel.channel;
	createDataChannel(false);
    };

    pc.onconnection = function(){
	console.log('connection');
    };

    pc.oniceconnectionstatechange = function(){
	console.log(pc);
    }

    var remote = false;
    var pendingIce = false;

    pc.onicecandidate = function(e) {
	// candidate exists in e.candidate
	if (e.candidate == null) { return }
	pc.addIceCandidate(new IceCandidate(e.candidate));
	socket.emit('icecandidate', {candidate:e.candidate, room:'party'});
    };

    pc.onnegotiationneeded = function(par){
	console.log('neg need ',par);
    }

    socket.on('icecandidate', function(cand){
console.log('cand ', cand);
	if(!cand) return;
	if(!remote) pendingIce = cand;
	else{
	    pc.addIceCandidate(new IceCandidate(cand));
	    pc.onicecandidate = null;
	}
    });

    var sender;

    rtc.offer = function(){
	createDataChannel(true);
	pc.createOffer(function (offer) {

	    pc.setLocalDescription(offer);

	    socket.emit('offer', {offer:offer, room:'party'});

	    socket.on('answer', function(answer){
		if(!answer) return;
		pc.setRemoteDescription(new RTCSessionDescription(answer));
		remote = true;
		if(pendingIce){
		    pc.addIceCandidate(new IceCandidate(cand));
		    pc.onicecandidate = null;
		}

	    });

	}, function (err) {
	    console.error(err);

	}, {//constraints
	    mandatory: {
		OfferToReceiveAudio: false,
		OfferToReceiveVideo: false
	    }
	});
    };

    socket.on('offer', function(offer){
	pc.setRemoteDescription(new RTCSessionDescription(offer), function(){
	    remote = true;
	    if(pendingIce){
		pc.addIceCandidate(new IceCandidate(pendingIce));
		pc.onicecandidate = null;
	    }

	    pc.createAnswer(function(answer){
		pc.setLocalDescription(answer);

		socket.emit('answer', {answer:answer, room:'party'});


	    }, function (err) {
		console.error(err);

	    }, {//constraints
		mandatory: {
		    OfferToReceiveAudio: false,
		    OfferToReceiveVideo: false
		}
	    });
	});

    });

    function createDataChannel(make){
	if(make) dataChannel = pc.createDataChannel("jsonchannel", {reliable: false});

console.log('opening connection');
	dataChannel.onerror = function (error) {
	    console.log("Data Channel Error:", error);
	};

	dataChannel.onmessage = function (event) {
	    console.log("Got Data Channel Message:", event.data);
	};

	dataChannel.onopen = function () {
	    dataChannel.send("Hello World!");

	    setTimeout(function(){
		var x = Math.random();
		console.log('x ',x);
		dataChannel.send('blah '+x);
	    }, 1000);
	};

	dataChannel.onclose = function () {
	    console.log("The Data Channel is Closed");
	};

    }



    var CONF = function(conf, provider){
	// use heroku websocket server as a signal channel

	// status
	Cani.core.cast('rtc', true);
    };

    Cani.core.on('dy', function(conf){ CONF(conf, 'dy');} );

    // expose save and load functions
    Cani.core.affirm('rtc', rtc);

    return rtc;

})(Cani.rtc||{});
