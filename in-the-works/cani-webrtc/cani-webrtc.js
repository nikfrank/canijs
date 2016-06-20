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

    var pcs = {};
    var dataChannels = {};
    var listeners = {};
    
    rtc.offer = function(sendSignalOffer, receiveSignalAnswer, postAnswer, dcLabel){
      var pc = new PeerConnection(server, {});
      pcs[dcLabel] = pc;

      console.log('offer on', dcLabel);
      dataChannels[dcLabel] = pcs[dcLabel].createDataChannel(dcLabel);
      initDataChannel(dataChannels[dcLabel]);

      pc.onicecandidate = function(e){
	if(e.candidate == null){ return;}

	pc.addIceCandidate(new IceCandidate(e.candidate));
	Cani.core.affirm('webrtc: IceCandidate', e.candidate);
      };
      
      pc.createOffer(function(offer){
	pc.setLocalDescription(offer);

	// this should instead wait for an ICE candidate and send it with
	// then the host will maintain a list of PCs, each with ICE
	Cani.core.confirm('webrtc: IceCandidate').then(candidate=>{
	  if(sendSignalOffer) sendSignalOffer(offer, candidate);
	  else{
	    // error! need to be able to send signal offer
	  }
	  Cani.core.defirm('webrtc: IceCandidate');
	});

	let receiveAnswer = function(answer){
	  if(!answer) return;
	  pc.setRemoteDescription(new RTCSessionDescription(answer));
	  if(postAnswer) postAnswer(answer);
	};

	if(receiveSignalAnswer) receiveSignalAnswer(receiveAnswer);
	else{
	  // error! need to be able to receive signal answer
	}

      }, function (err) {
	console.error('create offer error', err);

      }, {//constraints, check conf or connection type (audio/video?)
	mandatory: {
	  OfferToReceiveAudio: false,
	  OfferToReceiveVideo: false
	}
      });
    };

    rtc.acceptOffer = function({offer, candidate, dcLabel}, sendSignalAnswer){
      var pc = new PeerConnection(server, {});
      pcs[dcLabel] = pc;

      // set handlers when remote connector creates the dataChannel
      pc.ondatachannel = function(datachannel){
	// use the label to index the dataChannel
	dataChannels[datachannel.channel.label] = datachannel.channel;
	initDataChannel(datachannel.channel);
      };
      
      pc.setRemoteDescription(new RTCSessionDescription(offer), function(){
	pc.addIceCandidate(new IceCandidate(candidate));
	
	pc.createAnswer({
	  mandatory: {
	    OfferToReceiveAudio: false,
	    OfferToReceiveVideo: false
	  }}).then(function(answer){
	    pc.setLocalDescription(answer);

	    if(sendSignalAnswer) sendSignalAnswer(answer);
	    else{
	      // error, need to send signal error
	    }
	    
	  }, function (err) {
	    console.error(err);
	  });
      });
    };

    
    function initDataChannel(dc){
      dc.onerror = function(error){
	console.log("Data Channel Error:", error);
      };

      dc.onmessage = function(event){
	console.log("Got Data Channel Message:", event.data);
	console.log('raw', event);
	// send through all listeners
	(listeners[dc.label]||[]).forEach(function(cb){
	  cb(event.data);
	});
      };

      dc.onopen = function(){
	Cani.core.affirm('webrtc: datachannels['+dc.label+'].onopen', dc);
      };

      dc.onclose = function () {
	console.log("The Data Channel is Closed");
	dataChannels[dc.label] = null; // is there anything else to do?
	Cani.core.defirm('webrtc: datachannels['+dc.label+'].onopen');
      };
    }


    rtc.send = function(jsonOrStr, dcLabel){
      if(typeof jsonOrStr === 'object') jsonOrStr = JSON.stringify(jsonOrStr);
      
      return Cani.core.confirm('webrtc: datachannels['+dcLabel+'].onopen')
		 .then(function(dc){
		   return dc.send(jsonOrStr);
		 });
    };

    rtc.listen = function(dcLabel, cb){
      if(typeof cb !== 'function'){
	// error! can't call cb if it isn't a function.
      }else{
	if(!(dcLabel in listeners)) listeners[dcLabel] = [];
	listeners[dcLabel].push(cb);
      }
    };

    
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
