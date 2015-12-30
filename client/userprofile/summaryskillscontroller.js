angular.module('myApp')
	.controller('SummaryController', ['$scope', 'Account', 'profiledata', function($scope, Account, profiledata) {

		$scope.profile;
		$scope.userSkills=[];
		$scope.futureSkills = []
		  Account.getProfile().success(function(data){
		    $scope.profile = data.profile.github
			$scope.userSkills.push(data.profile.skills)
			for(var keys in data.profile.futureskills){
				console.log
				$scope.futureSkills.push(keys)
			}
			// $scope.futureSkills = data.profile.futureskills
		    // console.log('this is the data.profile:', data)
		  })
		  $scope.allUsers= []; 
		  profiledata.getAllUsers().success(function(data){
		  	for (var i=0; i<data.length; i++){
		  		$scope.allUsers.push(data[i])

		  	}
		  })
		  // $scope.allSkills=[];
		  // $scope.allFutureSkills = []
		  // for(var i=0; i< $scope.allUsers.length; i++){
		  // 	$scope.allSkills.push;
		  // 	$scope.allFutureSkills = []
		  // }
		  console.log("this is all users", $scope.allUsers)



	}])
