angular.module('myApp')
	.controller('FutureSkillsController', ['$scope','profileData', 'Account', function($scope, profileData, Account){
		$scope.profile;
		Account.getProfile().success(function(data){
		  $scope.profile = data.profile.github
		  // console.log('this is the data.profile:', data.profile.github)
		})

		$scope.add = function(){
			profileData.futureSkills({github: $scope.profile, python: $scope.python, java: $scope.java, swift: $scope.swift, android: $scope.android, ruby: $scope.ruby})
		}

	}])
