var config = require('../../config.js');
/*
  Room accepts the following dependencies:

$rootScope - it is used in order to invoke the $digest loop, once socket.io event is received. Since the socket.io event handlers are not wrapped inside $scope.$appy we need to invoke $digest manually.

$q - in order to provide promise based interface

Io - the wrapped socket.io global function

config - the configuration constant we defined in app.js.

 */
angular.module('myApp')
  .factory('Room', function ($rootScope, $q, Io) {
    var iceConfig = { 'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }]},
        peerConnections = {},
        currentId, roomId,
        stream;
    //This method uses peerConnections object, which creates a mapping between peer id and RTCPeerConnection object
    function getPeerConnection(id) {
      //Initially we check whether we have associated peer connection to the given id, if we do we simply return it.
      if (peerConnections[id]) {
        return peerConnections[id];
      }
      //If we don't have such peer connection we create a new one,
      var pc = new RTCPeerConnection(iceConfig);
      peerConnections[id] = pc;
      pc.addStream(stream);
      //we add the event handlers onicecandidate and onaddstream, we cache it and we return it.
      pc.onicecandidate = function (evnt) {
        socket.emit('msg', { by: currentId, to: id, ice: evnt.candidate, type: 'ice' });
      };
      //Once onaddstream is triggered, this means that the connection was successfully initiated
      pc.onaddstream = function (evnt) {
        console.log('Received new stream');
        //We can trigger peer.stream event and later visualize it in a video element on the page.
        api.trigger('peer.stream', [{
          id: id,
          stream: evnt.stream
        }]);
        if (!$rootScope.$$digest) {
          $rootScope.$apply();
        }
      };
      return pc;
    }
    //new offer is being initiated, when a peer connects the room
    //Once new peer joins the room makeOffer is invoked with the peer's id
    function makeOffer(id) {
      // The first thing we do is to getPeerConnection
      //If connection with the specified peer id already exists getPeerConnection will return it, otherwise it will create a new RTCPeerConnection and attach the required event handlers to it
      var pc = getPeerConnection(id);
      /*
        After we have the peer connection we invoke the createOffer method. This method will make a new request to the provided STUN server in the RTCPeerConnection configuration and will gather the ICE candidates. Based on the ICE candidates and the supported codecs, etc. it will create a new SDP offer, which we will send to the server. As we saw above the server will redirect the offer to the peer pointed by the property to of the event object.
      */
      pc.createOffer(function (sdp) {
        pc.setLocalDescription(sdp);
        console.log('Creating an offer for', id);
        socket.emit('msg', { by: currentId, to: id, sdp: sdp, type: 'sdp-offer' });
      }, function (e) {
        console.log(e);
      },
      { mandatory: { OfferToReceiveVideo: true, OfferToReceiveAudio: true }});
    }

    function handleMessage(data) {
      //In the first line we get the peer connection with the peer with id pointed by the by property. Once we get the connection we switch through the different message types:
      var pc = getPeerConnection(data.by);
      switch (data.type) {
        //if we receive this message, this means that we have just connected to the room and the rest of the peers inside this room want to initiate new peer connection with us
        case 'sdp-offer':
          //Step 1 - we setRemoteDescription (the description of the remote peer)
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            console.log('Setting remote description by offer');
            //Step 2 - In order to answer them with our ICE candidates, video codecs, etc. we create a new answer using createAnswer
            pc.createAnswer(function (sdp) {
              pc.setLocalDescription(sdp);
              // Step 3 - Once we prepare the SDP answer we send it to the appropriate peer via the server.
              socket.emit('msg', { by: currentId, to: data.by, sdp: sdp, type: 'sdp-answer' });
            });
          });
          break;
          // if we receive SDP answer by given peer, this means that we have already sent SDN offer to this peer.
        case 'sdp-answer':
          //We set the remote description and we hope that we'll successfully initiate the media connection between us (we hope we're not both behind symmetric NATs)
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
            console.log('Setting remote description by answer');
          }, function (e) {
            console.error(e);
          });
          break;
          //if in the process of negotiation new ICE candidates are being discovered the RTCPeerConnection instance will trigger onicecandidate event, which will redirect new msg message to the peer with whom we're currently negotiating.
        case 'ice':
          if (data.ice) {
            console.log('Adding ice candidates');
            //We simply add the ICE candidate to the appropriate peer connection using the addIceCandidate method.
            pc.addIceCandidate(new RTCIceCandidate(data.ice));
          }
          break;
      }
    }

    var socket = Io.connect('https://paired-up.herokuapp.com'),
        connected = false;

    function addHandlers(socket) {
        //fired when new peer joins the room.
      socket.on('peer.connected', function (params) {
        //Once this event is fired we initiate new SDP offer to this peer 
        makeOffer(params.id);
      });
      //fired when peer disconnects
      socket.on('peer.disconnected', function (data) {
        api.trigger('peer.disconnected', [data]);
        if (!$rootScope.$$digest) {
          $rootScope.$apply();
        }
      });
      //fired when new SDP offer/answer or ICE candidate are received
      socket.on('msg', function (data) {
        handleMessage(data);
      });
    }
    //Room provides the following public API:
    var api = {

      // joinRoom is used for joining already existing rooms
      joinRoom: function (r) {
        if (!connected) {
          socket.emit('init', { room: r }, function (roomid, id) {
            currentId = id;
            roomId = roomid;
          });
          connected = true;
        }
      },
      //createRoom is used for creating new rooms
      createRoom: function () {
        var d = $q.defer();
        socket.emit('init', null, function (roomid, id) {
          d.resolve(roomid);
          roomId = roomid;
          currentId = id;
          connected = true;
        });
        return d.promise;
      },
      //init is used for initializing the Room service
      init: function (s) {
        stream = s;
      }
    };
    EventEmitter.call(api);
    Object.setPrototypeOf(api, EventEmitter.prototype);

    addHandlers(socket);
    return api;
  });
