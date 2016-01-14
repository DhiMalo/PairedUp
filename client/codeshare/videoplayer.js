angular.module('myApp')
  .directive('videoPlayer', ['$sce', function ($sce) {
    return {
      template: '<div><video ng-src="{{trustSrc()}}" autoplay></video></div>',
      restrict: 'E',
      replace: true,
      scope: {
        vidSrc: '@'
      },
      link: function postLink(scope) {
        console.log('Initializing video-player');
        scope.trustSrc = function(){
          if(!scope.vidSrc){
            return undefined;
          }
          return $sce.trustAsResourceUrl(scope.vidSrc);
        };
      }
    };
  }]);
