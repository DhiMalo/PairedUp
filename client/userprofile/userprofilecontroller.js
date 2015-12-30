angular.module('myApp')
  .controller('ProfileController', ['$scope', '$http', '$state',  'Account', function($scope, $http, $state,  Account) {
    var loggedInInformation; 

    $scope.getProfile = function() {
      Account.setChekIfActivelyLoggedIn(false); 
      var promise = Account.getProfile()
      .then(function(response) {
        $scope.user = response.data.profile;
            // Store DisplayName in the localStorage of the browser: 
            Account.storeUserDisplayName(response.data.profile.displayName);
            return {};
          })
      .catch(function(response) {
        console.log("We have caught a response:", response);
      });
      return promise;
    };

    // Profile view for users who are not logged in: 
    if (Account.getCheckingIfLogInData() === null) {
        Account.setCheckingIfLogInData(1);
        Account.setCheckIfLoggedOut(true);
    }
      
    if (Account.getChekIfActivelyLoggedIn() && Account.getCheckingIfLogInData() !== '1') {
      Account.setCheckingIfLogInData(1);
      $scope.getProfile().then(function() {}, function(err) {
      console.log("Error: ", err);
      });

    // If a logged in user logs out
    } else if (Account.getCheckingIfLogInData() === '1' ){
        // then redirect them to the login page
        if (Account.getCheckIfLoggedOut() == 'true') {
          $state.go('login');
          // Otherwise, 
        } else {
          // find the user in db by displayName 
          $http.post('/getFromDatabaseBecausePersonSignedIn', {displayName: Account.getUserDisplayName()})
          .success(function(data, status) {
            $scope.user = data.user;
          });
        }
    }
  }]);
