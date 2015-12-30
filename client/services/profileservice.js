angular.module('myApp')
	.factory('profiledata', ['$http', function($http){
		var obj = {
			skills: ['hello']
		};

		obj.getAll = function() {
			return $http.get('/profile').success(function(data){
				angular.copy(data, obj.skills);
			});
		};

		obj.addSkills = function(id, skill){
			return $http.post('/skills/'+id, skill);
		};

		return obj;
	}]);