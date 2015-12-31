angular.module('myApp')
	.controller('ChatController', ['$scope', '$http', 'socket', '$filter', 'Account', function($scope, $http, socket, $filter, Account){
		
		$scope.username = Account.getLogInData();
		socket.on("publish message", function(data, other) {
				//Function apply helps implement the angular/socket.io interaction
				$scope.$apply(function(){
		    // Store the message in the list array and render it with Angular's two way data binding.
		    // Data returns an array of objects from our Mongo database
		    $scope.chat = data;  
		  });
			});

		  //When someone clicks the submit button for the template chat.
	  $scope.submit = function() {
	    //check if there is text in the box.
	    if ($scope.text) {
        //emit a new message with the text data. Will store this in the database. 
        socket.emit('new message', {text: $scope.text, date: $filter('date')(new Date(), 'MM/dd/yyyy h:mma'), username: $scope.username});
         // this is be sent to the socket.on('new messsages') on the server side.
      }
	  };
	}]);