/*
  RoomCtrl accepts as dependencies the following components:
$sce - used for setting the source of the video elements
VideoStream - used for getting the video stream from the user's camera
$location - used for redirecting the user to the room's URL
$routeParams - used for getting the room id
$scope - used for attaching data to it in order to achieve data-binding with the view
Room - service which we are going to define next. It is used for managing the peer connections.
*/
angular.module('myApp')
  .controller('RoomCtrl', ['$sce', 'VideoStream', '$location', '$stateParams', '$scope', 'Room', function ($sce, VideoStream, $location, $stateParams, $scope, Room) {
    //check whether WebRTC is supported. If it isn't we simply set content of the $scope.error property and stop the controller execution.
    if (!window.RTCPeerConnection || !navigator.getUserMedia) {
      $scope.error = 'WebRTC is not supported by your browser. You can try the app with Chrome and Firefox.';
      return;
    }
    var stream;
    /*
    VideoStream.get() returns a promise, which once resolved gives us the media stream of the user. When the promise is resolved we initialize the Room passing the stream as argument. In order to visualize the video captured by our web cam we use URL.createObjectURL, to be able to set it as src of a video element in our HTML.
    */
    VideoStream.get()
    .then(function (s) {
      stream = s;
      Room.init(stream);
      stream = URL.createObjectURL(stream);
      //check whether the roomId is provided
      if (!$stateParams.roomId) {
        //otherwise we create a new room. Once the room is created we redirect the user to the room's URL.
        Room.createRoom()
        .then(function (roomId) {
          $location.path('/codeshare/room/' + roomId);
        });
      } else {
        //If it is provided we simply join the room with the associated roomId: Room.joinRoom($routeParams.roomId);
        Room.joinRoom($stateParams.roomId);
      }
    }, function () {
      $scope.error = 'No audio/video permissions. Please refresh your browser and allow the audio/video capturing.';
    });
    $scope.peers = [];
    //peer.stream - a peer stream is received.
    Room.on('peer.stream', function (peer) {
      console.log('Client connected, adding new stream');
       //Once we receive a new peer stream we add it to the array $scope.peers, which is visualized on the page. The markup on the page maps each stream to a video element.
      $scope.$apply(function(){
        $scope.peers.push({
          id: peer.id,
          stream: URL.createObjectURL(peer.stream)
        });  
      });
    });
    //peer.disconnected - once a peer disconnects the peer.disconnected event is being fired
    Room.on('peer.disconnected', function (peer) {
      console.log('Client disconnected, removing stream');
      //When we receive this event we can simply remove the disconnected peer from the $scope.peers collection.
      $scope.peers = $scope.peers.filter(function (p) {
        return p.id !== peer.id;
      });
    });
    //get the local stream (your cam)
    $scope.getLocalVideo = function () {
      return $sce.trustAsResourceUrl(stream);
    };
  }]);
