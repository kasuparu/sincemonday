var timerApp = angular.module('timerApp', []);

timerApp.factory('timerFactory', function($http) {
	return {
		getTimerListAsync: function(screen_name, callback) {
			$http.get('/u/' + screen_name + '/timers').success(callback);
		}
	};
});

timerApp.controller('timerListController', function($scope, timerFactory) {
  timerFactory.getTimerListAsync('kasuparu', function(results) {
      console.log('timerListController async returned value');
      $scope.timers = results;
  });
});

timerApp
	.directive('timer', function() {
		return {
			restrict: 'A',
			scope: {
				timer: '=timer'
			},
			template:
				'<div>{{timer.name}}</div>',
			replace: true
		};
	});