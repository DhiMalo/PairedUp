angular.module('myApp')
.factory('socket', ['$rootScope', function($rootScope) {
  
  // Grab the current URL
  var currentURLRoot = window.location.href.split('/')[2];
  // currentURLRoot will be "paired-up.herokuapp.com" for Heroku, and "localhost:8080" for LocalHost.
  
  // Create a socket connection to our server.
  var socket = io.connect("https://"+currentURLRoot);
  return {
    //listen to events.
    on: function(eventName, callback){
      socket.on(eventName, callback);
    },
    //give off signals to anyone who might be listening (such as the server).
    emit: function(eventName, data) {
      socket.emit(eventName, data);
    }
  };
}]);
