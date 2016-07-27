var bootRTC = function(rtc, caniG = Cani){

  var Cani = caniG || Cani;

  if(!('browserRTC' in Cani.core.assets)){
    Cani.core.affirm('browserRTC', {
      PeerConnection: window.mozRTCPeerConnection ||
		      window.webkitRTCPeerConnection ||
		      window.RTCPeerConnection,
      IceCandidate: window.mozRTCIceCandidate || window.RTCIceCandidate,
      SessionDescription: window.mozRTCSessionDescription || window.RTCSessionDescription
    });
  }

  // use navigator.mediaDevices.getUserMedia for audio and video (later)
  
  // move the signalling (this) into cani-rtc-socket-signalling
  // then all that should be here is confirm rtc-signal-socket
  // and then set up the bindings onto rtc
  Cani.core.confirm(['socket', 'browserRTC']).then(function(modules){
    var socket = modules.socket;

    var PeerConnection = modules.browserRTC.PeerConnection;
    var IceCandidate = modules.browserRTC.IceCandidate;
    var SessionDescription = modules.browserRTC.SessionDescription;

    
    // are these still running?
    // put this in rtc.conf
    var server = {
      iceServers: [
	{url: "stun:23.21.150.121"},
	{url: "stun:stun.l.google.com:19302"}
      ]
    };

    var pcs = {};
    var dataChannels = {};
    var listeners = {};
    
    rtc.offer = function(sendSignalOffer, receiveSignalAnswer, dcLabel){
      if(!(dcLabel in pcs)) pcs[dcLabel] = new PeerConnection(server, {});
      var pc = pcs[dcLabel];
      
      dataChannels[dcLabel] = pc.createDataChannel(dcLabel);
      console.log(dataChannels);
      initDataChannel(dataChannels[dcLabel]);

      pc.oniceconnectionstatechange = function() {
	// there's something going on which I don't understand
	// when the host refreshes, the patron tries to reconnect
	// the patron isn't able to
	// from any situation.

	// it's as if the hanging connection caused by the host refresh
	// zombies the patron.
	
	console.log('ice change', Object.keys(pcs)
					.map(pci=>(pci+' '+pcs[pci].iceConnectionState)));
	if(pc.iceConnectionState === 'failed') pc.close();
      };
      
      pc.onicecandidate = function(e){
	if(e.candidate == null){ return;}

	pc.addIceCandidate(new IceCandidate(e.candidate));
	Cani.core.affirm('webrtc: IceCandidate', e.candidate);
      };
      
      pc.createOffer({
	//constraints, check conf or connection type (audio/video?)
	mandatory: {
	  OfferToReceiveAudio: false,
	  OfferToReceiveVideo: false
	}
      }).then(function(offer){
	pc.setLocalDescription(offer);

	// perhaps should uniquify the confirm key per peerConnection
	// this would only matter in instances where many PCs being made quickly
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
	};

	if(receiveSignalAnswer) receiveSignalAnswer(receiveAnswer);
	else{
	  // error! need to be able to receive signal answer
	}

      }, function(err){ console.error('create offer error', err);});
    };

    rtc.acceptOffer = function({offer, candidate, dcLabel}, sendSignalAnswer){
      var pc = new PeerConnection(server, {});
      pcs[dcLabel] = pc;

      // set handlers when remote connector creates the dataChannel
      pc.ondatachannel = function(datachannel){
	// use the label to index the dataChannel
	console.log('on data channel', datachannel.channel.label);
	dataChannels[datachannel.channel.label] = datachannel.channel;
	initDataChannel(datachannel.channel);
      };
      
      pc.setRemoteDescription(new RTCSessionDescription(offer)).then(function(){
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
      var dcLabel = dc.label;
      dc.onerror = function(error){
	console.log("Data Channel Error:", error);
      };

      dc.onmessage = function(event){
	console.log("Got Data Channel Message:", event.data);
	console.log('raw', event);
	// send through all listeners
	(listeners[dcLabel]||[]).forEach(function(cb){
	  cb(event.data);
	});
      };

      dc.onopen = function(){
	console.log('on open');
	Cani.core.affirm('webrtc: datachannels['+dcLabel+'].onopen', dc);
      };

      dc.onclose = function () {
	console.log("The Data Channel is Closed");
	if(dcLabel in listeners) delete listeners[dcLabel];
	delete dataChannels[dcLabel]; // is there anything else to do?
	//	delete pcs[dc.label];
	console.log(pcs);
	// destroy pc, listeners
	// do I need to remove ice candidates?

	// there's a bug now, that when a connection is closed by the host
	// then the patron becomes unconnectable
	
	Cani.core.defirm('webrtc: datachannels['+dcLabel+'].onopen');
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
