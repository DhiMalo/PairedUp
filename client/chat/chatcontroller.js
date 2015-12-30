angular.module('myApp')
	.controller('ChatController', ['$scope', '$http', 'socket', '$filter', 'Account', function($scope, $http, socket, $filter, Account){

        // $scope.date = $filter('date')(new Date(), 'MM/dd/yyyy h:mma');
 
         $scope.username = Account.getUserDisplayName();
	    socket.on("publish message", function(data, other) {
	        //Angular was not interacting inside socket well. So the function apply was needed to smooth over the bugs.
	        $scope.$apply(function(){
	            //store the message in the list array. Thus rendering it on the page, thanks to Angular's two way data binding.
	        	// console.log('this is data', data)
	        	//data comes from mongo and returns an array of objects
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
	    //So this is currently function is still not working so we will leave it out for now
	    // $scope.sendMessage = function (fromUser, toUser) {
	    //   ///TODO: grab current user's name and the other user's name

	    //   //store that name in a object
	    //     var roomName = {
	    //         userWhoClicked: fromUser,
	    //         userWhoWasClicked: toUser
	    //     };
	    //   //socket emit chatRoom with this users name and the other users name
	    //     socket.emit("chatBox", roomName);
	    // };