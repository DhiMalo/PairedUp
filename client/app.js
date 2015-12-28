angular.module('myApp', [
	'ui.router',
	'ui.ace',
	'ui.bootstrap',
	// 'myApp.codeshare',
   //for client side sockets
  'btford.socket-io',
  // 'myApp.services',
  // 'myApp.current',
  // 'Icecomm',
  'xeditable'
])
.config(function($stateProvider, $urlRouterProvider, $locationProvider){

	$stateProvider
	
		.state('login', {
			url: '/login',
			// controller: 'NavbarController'
		})
    .state('logout', {
      url: '/logout',
      template: null,
      controller: 'LogoutController'
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'userprofile/userprofile.html',
      controller: 'ProfileController'
    })

    .state('profile.start', {
      url: '/start',
      templateUrl: 'userprofile/start.html',
      controller: 'ProfileController'
    })

      .state('profile.currentskills', {
        url: '/currentskills',
        templateUrl: 'userprofile/currentskills.html',
        controller: 'CurrentSkillsController'
      })
      .state('profile.futureskills', {
        url: '/futureskills',
        templateUrl: 'userprofile/futureskills.html',
        controller: 'ProfileController'
      })

       .state('profile.summary', {
        url: '/summary',
        templateUrl: 'userprofile/summary.html',
        controller: 'ProfileController'
      })

		.state('codeshare', {
			url: '/codeshare',
			templateUrl: 'codeshare/codeshare.html',
			controller: 'CodeShareController'
		})
    .state('codeshare.room2', {
      url: '/room/:roomId',
      templateUrl: 'codeshare/room.html',
      controller: 'RoomCtrl'
    })
    .state('codeshare.room', {
      url: '/room',
      templateUrl: 'codeshare/room.html',
      controller: 'RoomCtrl'
    })
    .state('chat', {
      url: '/chat',
      templateUrl: 'chat/chat.html',
      controller: 'ChatController'
    })

	$urlRouterProvider.otherwise('/');

})

.controller('LoginController', function($scope,$location, $http) {


})


// .controller('LogoutController', ['$scope', '$http', '$state','$window','Account', function($scope, $http, $state, $window, Account){
//       delete $window.localStorage.UserDisplayName;
//       // $window.localStorage.loggedIn = 0;

//       // $window.localStorage.loggedOut = true;
//       // $Acount.setLoggedOutData(true);
//       // console.log("day");
//       $state.go('login');
// }])
/*

  Nav Bar Controller

*/
// .controller('NavbarController', function($scope, $http, $window, Account) {
//   console.log("This is the document cookie", document.cookie);
//   $scope.clickedLogin = function() {
//     Account.setLoggedOutData(false);
//     Account.setData(true);
//     Account.setCheckingIfLogInData(2);
//     // $scope.isAuthenticated();
//   };
//   $scope.goingToLogOut = function() {
//     Account.setLoggedOutData(true);
//   };
//   $scope.isAuthenticated = function() {
//     return $http.get('/checkIfLoggedIn').then(function(response){
//       console.log('this is isAuthenticated', response, 'response.data', response.data.loggedIn)
//       return response.data.loggedIn;
//   });
//   };  
//   // $scope.isAuthenticated();
// })



// .factory('Account', function($http, $window) {

//     return {
//       getProfile: function() {
//         console.log('inside the factory-------------');
//           return $http.get('/account')
//         .success(function(req, res){
//           console.log('this is a successful callback of /account', res);
//           console.log('this is a successful callback of /account for req', req);
         
//           // console.log(test);
//           console.log('this is req.data.whatever', req.profile)
//           // $scope.username = req.data.profile.username;
//         })
      
//       },

//       isAuthenticated: function() {
//           return $http.get('/checkIfLoggedIn').then(function(response){
//             console.log('this is isAuthenticated', response, 'response.data', response.data.loggedIn)
//             return response.data.loggedIn;
//         });
//         },

//       setData: function(val) {
//             $window.localStorage && $window.localStorage.setItem('notLoggedIn', val);
//             return this;
//           },
//           //sets the value, of whether the user is logged our, into the localStorage. 
//           setLoggedOutData: function(val) {
//             $window.localStorage && $window.localStorage.setItem('Loggedout', val);
//             return this;
//           },
//           //sets the value, of the display name, into the localStorage. 

//       setLogInData: function(val) {
//             $window.localStorage && $window.localStorage.setItem('UserDisplayName', val);
//             return this;
//           },
//           getLogInData: function() {
//             return $window.localStorage && $window.localStorage.getItem('UserDisplayName');
//           },
//           //another check to login, used to make separate decisions on whether the user is already logged in or logged out.
//           setCheckingIfLogInData: function(val) {
//             $window.localStorage && $window.localStorage.setItem('loggedIn', val || 1);
//             return this;
//           },
//           getCheckingIfLogInData: function() {
//             return $window.localStorage && $window.localStorage.getItem('loggedIn');
//           },
//           getLoggedOutData: function() {
//             return $window.localStorage && $window.localStorage.getItem('Loggedout');
//           },
//           getData: function() {
//             return $window.localStorage && $window.localStorage.getItem('notLoggedIn');
//           },
//       updateProfile: function(profileData) {
//         return $http.put('/api/me', profileData);
//       }
//     };
// })

// .factory('socket', ['$rootScope', function($rootScope) {
//     //A socket connection to our server.
//   var socket = io.connect("http://localhost:8080");
//   return {
//     //listen to events.
//     on: function(eventName, callback){
//       socket.on(eventName, callback);
//     },
//     //give off signals to anyone who might be listening (such as the server).
//     emit: function(eventName, data) {
//       socket.emit(eventName, data);
//     }
//   };
// }])
//example chat for front end. 
// .controller('ExampleController', ['$scope', '$http', 'socket', function($scope, $http, socket){
//       //Where the text is held for the template chat. The template chat is not persisting data.
//     $scope.list = [];
//       //Listen when the server emits publish message and preform the a callback. This is to simulate going back to the server and have the info come back, as we will on the fully functional chat. 
//     socket.on("publish message", function(data) {
//         //set $scope.text to the text from the messages we received from the server (and database (?)).
//         $scope.text = data.text;
//         //Angular was not interacting inside socket well. So the function apply was needed to smooth over the bugs.
//         $scope.$apply(function(){
//             //store the message in the list array. Thus rendering it on the page, thanks to Angular's two way data binding.
//             $scope.list.push(data.text); 
        
//         });
//     });

//     $scope.sendMessage = function (fromUser, toUser) {
//       ///TODO: grab current user's name and the other user's name

//       //store that name in a object
//         var roomName = {
//             userWhoClicked: fromUser,
//             userWhoWasClicked: toUser
//         };
//       //socket emit chatRoom with this users name and the other users name
//         socket.emit("chatBox", roomName);
//     };

//     //When someone clicks the submit button for the template chat.
//     $scope.submit = function() {
//         //if there is text in the box.
//         if ($scope.text) {
//             //emit a new message with the text data. Will store this in the database. 
//             socket.emit('new message', {text: $scope.text});
//         }
//     };
// }]);


Object.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
  obj.__proto__ = proto;
  return obj;
};
