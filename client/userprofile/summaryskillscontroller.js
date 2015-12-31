angular.module('myApp')
	.controller('SummaryController', ['$scope', 'Account', 'profileData', 'documentData', function($scope, Account, profileData, documentData) {

		//track skills section

		$scope.profile;
		$scope.userSkills=[];
		$scope.futureSkills = [];

		Account.getProfile().success(function(data){
		  $scope.profile = data.profile.github;
			$scope.userSkills.push(data.profile.skills);

			for(var keys in data.profile.futureskills){
				$scope.futureSkills.push(keys)
			}
		})

		$scope.allUsers= []; 
		
		profileData.getAllUsers().success(function(data){
		 	for (var i=0; i<data.length; i++){
		  	$scope.allUsers.push(data[i]);
		  	}
		})
		
		console.log("this is all users", $scope.allUsers);

	//track docuents section

		console.log('ready to do the documentTracker works');
	  
	  $scope.allDocs= []; 
	  
	  documentData.getAllDocs()
	  // .success(function(data){
	  //       for (var i = 0; i < data.length; i++){
	  //         $scope.allDocs.push(data[i])
	  //     }
	  //   })

	  console.log("this is all docs", $scope.allDocs);

	}])
