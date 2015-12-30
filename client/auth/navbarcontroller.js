angular.module('myApp')
	.controller('NavbarController', function($scope, $http, $window, Account) {
	  $scope.clickedLogin = function() {
	    Account.setCheckIfLoggedOut(false);
	    Account.setChekIfActivelyLoggedIn(true);
	    Account.setCheckingIfLogInData(2);
	  };
	  $scope.goingToLogOut = function() {
	    Account.setCheckIfLoggedOut(true);
	  };

	});