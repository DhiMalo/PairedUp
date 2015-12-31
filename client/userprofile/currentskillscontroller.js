angular.module('myApp')
.controller('CurrentSkillsController', ['$scope','profiledata', 'Account', function($scope, profiledata, Account){
  $scope.currentskills = profiledata.skills;

  $scope.profile;
  Account.getProfile().success(function(data){
    $scope.profile = data.profile.github
    // console.log('this is the data.profile:', data.profile.github)
  })

  // $scope.currentskills = profiledata.skills
  // $scope.currentskills = userdata.skills;

  $scope.add = function(){
  // console.log('this is the Account data', $scope.profile);
  profiledata.addSkills({github: $scope.profile, node:$scope.node, angular:$scope.angular, html:$scope.html, css:$scope.css, jquery:$scope.jquery, java:$scope.java, ruby:$scope.ruby, 
    swift:$scope.swift, python:$scope.python, go:$scope.go})
    // .success(function(skill){
    //   $scope.currentskills.push(skill)
    // console.log('this is currentskills', $scope.currentskills)
    
      // })
}

}]);
