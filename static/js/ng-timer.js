var timerApp = angular.module('timerApp', [
	'ngRoute'
]);

timerApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider
			.when('/u/:screen_name/', {
				controller: 'timerListController',
				template: '' + 
					'<div class="row-fluid">' +
						'<div class="span12">' +
							'<p class="lead">{{headerText}}</p>' +
						'</div>' +
					'</div>' + 
					'<div class="container-fluid counter-container" id="countercontainer" ng-class="{\'loading\': loading}">' +
						'<div list-message="message"></div>' +
						'<div ng-repeat="n in timers.range()" class="row-fluid" id="countercontainerrow{{n}}">' +
							'<div ng-repeat="item in timers.slice(n, n+3)" timer="item" id="counter{{item.id}}"></div>' +
						'</div>' +
					'</div>' +
					'<div class="row-fluid">' +
						'<div class="span12">' +
							'<p class="lead">{{headerTextFriends}}</p>' +
						'</div>' +
					'</div>' + 
					'<hr>' + 
					'<div class="container-fluid counter-container" id="friendcountercontainer" ng-class="{\'loading\': loadingFriends}">' +
						'<div ng-repeat="n in friendsTimers.range()" class="row-fluid" id="friendcountercontainerrow{{n}}">' +
							'<div ng-repeat="item in friendsTimers.slice(n, n+3)" timer="item" id="friendcounter{{item.id}}"></div>' +
						'</div>' +
					'</div>'
			})
			.otherwise({
				redirectTo: '/' // Change that!
			});
	}
]);

timerApp.factory('timerListFactory', function($http) {
	return {
		getTimerListAsync: function(type, screen_name, callback) {
			$http.get('/' + type + '/' + screen_name + '/timers').success(callback);
		}
	};
});

timerApp.controller('timerListController', ['$scope', '$routeParams', 'timerListFactory', function($scope, $routeParams, timerListFactory) {
	$scope.loading = true;
	$scope.loadingFriends = true;
	
	var createRange = function(target) {
		return function () {
			var range = [];
			for (var i = 0; i < target.length; i = i + 3) range.push(i);
			return range;
		}
	}
	
	timerListFactory.getTimerListAsync('u', $routeParams.screen_name, function(results) {
		$scope.loading = false;
		if (results.length === 0) {
			$scope.timers = [];
			$scope.message = {'text': 'У пользователя нет публичных таймеров.'};
		} else {
			$scope.timers = results;
			
		}
		$scope.timers.range = createRange($scope.timers);
	});
	
	timerListFactory.getTimerListAsync('f', $routeParams.screen_name, function(results) {
		$scope.loadingFriends = false;
		if (results.length === 0) {
			$scope.friendsTimers = [];
			$scope.headerTextFriends = '';
		} else {
			$scope.friendsTimers = results;
			$scope.headerTextFriends = 'Таймеры друзей';
		}
		$scope.friendsTimers.range = createRange($scope.friendsTimers);
	});
}]);

timerApp.factory('timerFactory', function($http) {
	return {
		getTimerAsync: function(id, callback) {
			$http.get('/t/' + id + '/show').success(callback);
		},
		
		timerGetTime: function(last_restart, format, debug) {
			debug = debug || 0;
			format = format || 0;
			var date_1 = new Date();
			var date_2 = new Date(last_restart * 1000);
			var time = Array(4);
			if ( date_1.getTime() > date_2.getTime() ) { // last_restart is in future
			  date_1 = date_2;
			  date_2 = new Date();
			}
			if (format == 0) {
			  var date_diff = Array(6);
			  date_diff[0] = Date.DateDiff('yyyy',date_1,date_2,1);
			  date_diff[1] = Date.DateDiff('m',date_1,date_2,1);
			  date_diff[2] = Date.DateDiff('d',date_1,date_2,1);
			  date_diff[3] = Date.DateDiff('h',date_1,date_2,1);
			  date_diff[4] = Date.DateDiff('n',date_1,date_2,1);
			  date_diff[5] = Date.DateDiff('s',date_1,date_2,1);
			  if (debug == 1) {
				console.log('debugging timerGetTime: '+last_restart+' yyyy'+date_diff[0]+' m'+date_diff[1]+' d'+date_diff[2]+' h'+date_diff[3]+' n'+date_diff[4]+' s'+date_diff[5]);
			  }
			  if (date_diff[0] != 0) { // diff is MORE than year
				if (debug == 1) { console.log('diff is MORE than year'); }
				time[0] = date_diff[0];
				time[1] = 'г.';
				time[2] = Date.DateDiff('m',Date.DateAdd('yyyy',time[0],date_1),date_2,1);
				time[3] = 'мес.';
				if (time[2] < 0) {
				  time[0] = date_diff[0] - 1;
				  time[2] = Date.DateDiff('m',Date.DateAdd('yyyy',time[0],date_1),date_2,1);
				  if (time[0] == 0) {
				time[0] = time[2];
				time[1] = time[3];
				time[2] = Date.DateDiff('d',Date.DateAdd('m',time[0],date_1),date_2,1);
				time[3] = 'д.';
				if (time[2] < 0) {
				  time[0] = date_diff[1] - 1;
				  time[2] = Date.DateDiff('d',Date.DateAdd('m',time[0],date_1),date_2,1);
				}
				// if a few days over the year -->
				if (time[0] == 0) {
				  time[0] = time[2];
				  time[1] = time[3];
				  time[2] = Date.DateDiff('h',Date.DateAdd('d',time[0],date_1),date_2,1);
				  time[3] = 'ч';
				  if (time[2] < 0) {
					time[0] = date_diff[1] - 1;
					time[2] = Date.DateDiff('h',Date.DateAdd('d',time[0],date_1),date_2,1);
				  }
				}
				// <-- if a few days over the year. NEED NEW YEAR TESTING FOR HOURS AND MINUTES
				  }
				}
			  } else { // diff is less than year
				if (date_diff[1] != 0) { // diff is MORE than month
				  if (debug == 1) { console.log('diff is MORE than month'); }
				  time[0] = date_diff[1];
				  time[1] = 'мес.';
				  time[2] = Date.DateDiff('d',Date.DateAdd('m',time[0],date_1),date_2,1);
				  time[3] = 'д.';
				  if (time[2] < 0) {
				time[0] = date_diff[1] - 1;
				time[2] = Date.DateDiff('d',Date.DateAdd('m',time[0],date_1),date_2,1);
				if (time[0] == 0) {
				  time[0] = time[2];
				  time[1] = time[3];
				  time[2] = Date.DateDiff('h',Date.DateAdd('d',time[0],date_1),date_2,1);
				  time[3] = 'ч';
				}
				  }
				} else { // diff is less than month
				  if (date_diff[2] != 0) { // diff is MORE than day
				if (debug == 1) { console.log('diff is MORE than day'); }
				time[0] = date_diff[2];
				time[1] = 'д.';
				time[2] = Date.DateDiff('h',Date.DateAdd('d',time[0],date_1),date_2,1);
				time[3] = 'ч';
				  } else { // diff is less than day
				if (date_diff[3] != 0) { // diff is MORE than hour
				  if (debug == 1) { console.log('diff is MORE than hour'); }
				  time[0] = date_diff[3];
				  time[1] = 'ч';
				  time[2] = Date.DateDiff('n',Date.DateAdd('h',time[0],date_1),date_2,1);
				  time[3] = 'мин';
				} else { // diff is less than hour
				  if (date_diff[4] != 0) { // diff is MORE than minute
					if (debug == 1) { console.log('diff is MORE than minute'); }
					time[0] = date_diff[4];
					time[1] = 'мин';
					time[2] = Date.DateDiff('s',Date.DateAdd('n',time[0],date_1),date_2,1);
					time[3] = 'с';
				  } else { // diff is less than minute
					if (debug == 1) { console.log('diff is less than minute'); }
					time[0] = date_diff[5];
					time[1] = 'с';
					time[2] = '';
					time[3] = '';
				  }
				}
				
				  }
				}
			  }
			}
			if (time[2] == 0) {
			  time[2] = '';
			  time[3] = '';
			}
			return time;
		},
		
		
	};
});

timerApp.controller('timerController', ['$scope', 'timerFactory', function($scope, timerFactory) {
	$scope.show = function(id) {
		$scope.loading = true;
		timerFactory.getTimerAsync(id, function(results) {
			$scope.loading = false;
			$scope.timer = results;
		});
	};
	$scope.edit = function() {
		$scope.editor = true;
		$scope.editableTimer = $scope.timer;
	};
	
	$scope.save = function() {
		$scope.editor = false;
		$scope.timer = $scope.editableTimer;
	};
	
	$scope.cancel = function() {
		$scope.editor = false;
		$scope.editableTimer = $scope.timer;
	};
}]);

timerApp
	.directive('timer', function() {
		/*var items = '';
		if (data.set == 1) {
			data.denied = data.denied || 0;
			if (data.denied == 0) {
				var debug = 0;
				var items = '';
				var element_id_time = element_id.replace('#','')+'time';
				var restart_link = element_id.replace('#','')+'restart';
				var edit_link = element_id.replace('#','')+'edit';
				var twitter_link = element_id.replace('#','')+'twitter';
				// Good
				if (data.good == 1) {
				  $(element_id).removeClass("timer-good timer-bad timer-neutral").addClass("timer-good");
				  items+='<div class="icon-good"><i class="icon-thumbs-up"></i></div>';
				} else if (data.good == 0) {
				  $(element_id).removeClass("timer-good timer-bad timer-neutral").addClass("timer-bad");
				  items+='<div class="icon-good"><i class="icon-thumbs-down"></i></div>';
				} else {
				  $(element_id).removeClass("timer-good timer-bad timer-neutral").addClass("timer-neutral");
				  items+='<div class="icon-good"><i class="icon-adjust"></i></div>';
				}
				// Public
				if (data.public == 1) {
				  $(element_id).removeClass("timer-public timer-private").addClass("timer-public");
				  items+='<div class="icon-public"><i class="icon-eye-open"></i></div>';
				} else if (data.public == 0) {
				  $(element_id).removeClass("timer-public timer-private").addClass("timer-private");
				  items+='<div class="icon-public"><i class="icon-eye-close"></i></div>';
				}
				if (data.owner_name) {
				  items+='<div class="icon-name"><a href="/u/'+data.owner_name+'">'+data.owner_name+'</a></div>';
				}
				items+='<div class=""><center>';
				items+=data.name;
				items+='</center></div>';
				items+='<div class="" id="'+element_id_time+'"><center>';
				items+='</center></div>';
				items+='<div class=""><center>';
				if (data.can_edit == 1 || data.id == 0) {
				  items+='<a class="btn btn-danger" href="#" id="'+restart_link+'"><i class="icon-white icon-repeat"></i> Сброс</a>';
				}
				if (data.public == 1) {
				  if (data.owner_name != null) {
					var url='http://'+window.location.hostname+'/u/'+data.owner_name;
				  } else {
					var url='http://'+window.location.hostname;
				  }
				  items+=' <a href="" class="twitter-share-button btn btn-inverse" target="_blank" id="'+twitter_link+'"><img src="https://twitter.com/favicons/favicon.ico"> Твитнуть</a>';
				}
				if (data.can_edit == 1) {
				  items+=' <a href="#" id="'+edit_link+'" class="btn">&nbsp;<i class="icon-pencil"></i>&nbsp;</a>';
				}
				items+='</center></div>';
				$(element_id).html(items);
				timerShowTime(data.last_restart,'#'+element_id_time,0,debug);
				timerTwitterButtonHref('#'+twitter_link,url,data.owner_name,data.name,data.last_restart);
				var stop_timer = setInterval(
				  function() {
					timerShowTime(data.last_restart,'#'+element_id_time);
					timerTwitterButtonHref('#'+twitter_link,url,data.owner_name,data.name,data.last_restart);
				  },1000
				);
				if (data.can_edit == 1 || data.id == 0) {
				  $('#'+restart_link).click(function() {
					  timerRestart(data.id,'#'+element_id.replace('#',''),stop_timer);
					  return false;
				  });
				}
				if (data.can_edit == 1) {
				  $('#'+edit_link).click(function() {
					  timerSet(data.id,element_id.replace('#',''),stop_timer);
					  return false;
				  });
				}
			} else {
				var items = '';
				items+='<div class=""><center>';
				items+='Доступ к таймеру запрещён';
				items+='</center></div>';
				$(element_id).html(items);
			}
	    } else {
			var items = '';
			var edit_link = element_id.replace('#','')+'edit';
			items+='<div class=""><p><center>';
			items+='<h3>Создать таймер</h3>';
			items+='</center></p></div>';
			items+='<div class=""><center>';
			if (data.id == -1) {
				items+=' <a class="btn btn-success btn-large" href="#" id="'+edit_link+'"><i class="icon-white icon-plus"></i> Добавить</a>';
			}
			items+='</center></div>';
			items+='<div class=""><p><center>';
			items+=' ';
			items+='</center></p></div>';
			$(element_id).html(items);
			$(element_id).removeClass("timer-good timer-bad timer-neutral").addClass("timer-neutral");
			if (data.id == -1) {
				$('#'+edit_link).click(function() {
					timerSet(data.id,element_id.replace('#',''));
					return false;
				});
			}
	    }*/
		
		
		return {
			restrict: 'A',
			scope: {
				timer: '=timer',
				editor: '@editor'
			},
			controller: 'timerController',
			template:
				'<div ng-class="{' +
					'\'loading\': loading,' +
					'\'timer-good\': timer.good == 1,' +
					'\'timer-bad\': timer.good == 0,' +
					'\'timer-neutral\': (timer.good != 1) && (timer.good != 0),' +
					'\'timer-public\': timer.public == 1,' +
					'\'timer-private\': timer.public == 0' +
				'}" class="span4 well timer" editor="false">' +
					'<div class="icon-good"><i ng-class="{' +
						'\'icon-thumbs-up\': timer.good == 1,' +
						'\'icon-thumbs-down\': timer.good == 0,' +
						'\'icon-adjust\': (timer.good != 1) && (timer.good != 0)' +
					'}"></i></div>' +
					'<div class="icon-public"><i ng-class="{' +
						'\'icon-eye-open\': timer.public == 1,' +
						'\'icon-eye-close\': timer.public == 0' +
					'}"></i></div>' +
					'<div class="icon-name" ng-if="timer.owner_name">' +
						'<a ng-href="/u/{{timer.owner_name}}">{{timer.owner_name}}</a>' +
					'</div>' +
					'<a ng-click="show(timer.id)">{{timer.name}}</a>' +
					'<a ng-show="editor" ng-click="save()">Save</a>' +
					'<a ng-show="editor" ng-click="cancel()">Cancel</a>' +
					'<a ng-hide="editor" ng-click="edit()">Edit</a>' +
				'</div>',
				
			transclude: true,
			replace: true
		};
	})
	.directive('listMessage', function() {
		return {
			restrict: 'A',
			scope: {
				message: '=listMessage'
			},
			template:
				'<div><center><p>{{message.text}}</p></center></div>',
			replace: true
		};
	});