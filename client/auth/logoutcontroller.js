angular.module('myApp')
  .controller('LogoutController', ['$scope', '$http', '$state','$window','Account', function($scope, $http, $state, $window, Account){
    delete $window.localStorage.UserDisplayName;
    $state.go('login');
  }]);