angular.module('myApp')
  //Basically here we wrap io inside a service, in order to allow the users to inject it, instead of using the global io. 
  //This will allow us to mock io easily instead of monkey patching it, when we want to write tests.
  .factory('Io', function () {
    if(typeof io === 'undefined'){
      throw new Error('Socket.io required');
    }
    return io;
  });