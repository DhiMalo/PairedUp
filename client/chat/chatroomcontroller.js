angular.module('myApp')
	.controller('ChatRoomController', ['$scope', 'Account', 'socket', function($scope, Account, socket){
		$scope.roomname
		$scope.username = Account.getLogInData()
		$scope.enter = function(name){
			$scope.roomname = name
			socket.emit('/createroom', {roomname: $scope.roomname, creator: $scope.username})
		    $scope.newName = " "
		};


	}])
