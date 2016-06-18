var bootRTC = function(rtc, caniG = Cani){

  var Cani = caniG || Cani;

  // move the signalling (this) into cani-rtc-socket-signalling
  // then all that should be here is confirm rtc-signal-socket
  // and then set up the bindings onto rtc
  Cani.core.confirm('socket').then(function(socket){

    // check that this still works
    var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
    var SessionDescription = window.mozRTCSessionDescription ||
			     window.RTCSessionDescription;
    
    navigator.getUserMedia = navigator.getUserMedia ||
			     navigator.mozGetUserMedia ||
			     navigator.webkitGetUserMedia;
    // this to be in a try block

    
    // are these still running?
    // put this in rtc.conf
    var server = {
      iceServers: [
	{url: "stun:23.21.150.121"},
	{url: "stun:stun.l.google.com:19302"}
      ]
    };

    // maybe changed.. HAHAHAHAHAH it did. and this comment didnt help!
    // this originally had rtpDataChannel options in there, but now SCTP is standard
    // you can look at older than 0.2.10 I think for the old code!
    var options = {};

    var pc = new PeerConnection(server, options);

    var dataChannel;

    // ondatachannel (datachannel) -> set handlers
    pc.ondatachannel = function(datachannel){
      dataChannel = datachannel.channel;
      createDataChannel(false);
    };

    var remote = false;
    var pendingIce = false;

    pc.onicecandidate = function(e) {
      // candidate exists in e.candidate
      if (e.candidate == null) { return }

      pc.addIceCandidate(new IceCandidate(e.candidate));
      socket.emit('icecandidate', {candidate:e.candidate, room:'party'});
    };

    socket.on('icecandidate', function(cand){
      console.log('client use host ice');
      if(!cand) return;
      if(!remote) pendingIce = cand;
      else{
	pc.addIceCandidate(new IceCandidate(cand));
	pc.onicecandidate = null;
      }
    });

    var sender;

    // find the demo code that runs "offer"
    // this needs a lot of hooks for sending identity
    // and confirming identity before answering

    // rtc.createNode = function(roomName){};
    var roomName;
    rtc.offer = function(signalOffer){
      createDataChannel(true);

      pc.createOffer(function (offer) {
	pc.setLocalDescription(offer);

	setTimeout(()=>{
	  if(!signalOffer){
	    socket.emit('offer', {offer:offer, room:roomName||'party'});
	  }else{
	    signalOffer(offer);
	  }
	}, 1000);
	
	socket.on('answer', function(answer){
	  if(!answer) return;
	  pc.setRemoteDescription(new RTCSessionDescription(answer));
	  remote = true;
	  if(pendingIce){
	    pc.addIceCandidate(new IceCandidate(pendingIce));
	    pc.onicecandidate = null;
	  }
	});

      }, function (err) {
	console.error(err);

      }, {//constraints, check conf or connection type (audio/video?)
	mandatory: {
	  OfferToReceiveAudio: false,
	  OfferToReceiveVideo: false
	}
      });
    };

    socket.on('offer', function(offer){
      // here is where to decide if to accept the offer
      pc.setRemoteDescription(new RTCSessionDescription(offer.offer), function(){
	remote = true;
	if(pendingIce){
	  pc.addIceCandidate(new IceCandidate(pendingIce));
	  pc.onicecandidate = null;
	}

	pc.createAnswer({
	  mandatory: {
	    OfferToReceiveAudio: false,
	    OfferToReceiveVideo: false
	  }}).then(function(answer){
	    pc.setLocalDescription(answer);
	    socket.emit('answer', {answer:answer, room:'party'});
	    
	  }, function (err) {
	    console.error(err);	  
	  });
      });

    });

    function createDataChannel(make){
      if(make) dataChannel = pc.createDataChannel("jsonchannel");

      dataChannel.onerror = function (error) {
	console.log("Data Channel Error:", error);
      };

      dataChannel.onmessage = function (event) {
	console.log("Got Data Channel Message:", event.data);
      };

      dataChannel.onopen = function () {
	console.log('data open');
	dataChannel.send("Hello World!");

	setTimeout(function(){
	  var x = Math.random();
	  console.log('x ', x);
	  dataChannel.send('blah ' + x);
	}, 1000);
      };

      dataChannel.onclose = function () {
	console.log("The Data Channel is Closed");
      };

    }
    
    // rtc.setSignalChannel({...})

    // rtc.listHubs(){ return [...];}
    // rtc.createHub().then()
    // rtc.onOffer = function(offer){}
    // rtc.onRemoteConnection = function(peer){}


    // rtc.connectToHub(hubId).then(successFn, rejectFn)
    // rtc.hub[id].onmessage = function(message){}

    // rtc.disconnectFromHub(hubId).then()

    //... those for dataChannels
    //... then for video/audio
    // expose save and load functions
    Cani.core.affirm('rtc', (Cani.rtc = rtc));
  });
};

if(typeof require === 'function'){
  module.exports = bootRTC;
}else{
  bootRTC(Cani.rtc||{});
}
