/***
 *       _       _     _ _ _   _                   _ 
 *      /_\   __| | __| (_) |_(_) ___  _ __   __ _| |
 *     //_\\ / _` |/ _` | | __| |/ _ \| '_ \ / _` | |
 *    /  _  \ (_| | (_| | | |_| | (_) | | | | (_| | |
 *    \_/ \_/\__,_|\__,_|_|\__|_|\___/|_| |_|\__,_|_|
 *                                                   
 */
// attach the .compare method to Array's prototype to call it on any array
Array.prototype.compare = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0; i < this.length; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

/***
 *       ___             __ _       
 *      / __\___  _ __  / _(_) __ _ 
 *     / /  / _ \| '_ \| |_| |/ _` |
 *    / /__| (_) | | | |  _| | (_| |
 *    \____/\___/|_| |_|_| |_|\__, |
 *                            |___/ 
 */
var timerApp = angular.module('timerApp', [
	'ngRoute',
	'ui.bootstrap'
]);

timerApp
	.config(['$routeProvider', '$locationProvider',
		function($routeProvider, $locationProvider) {
			$locationProvider.hashPrefix('!');
			
			$routeProvider
				.when('/u/:screen_name/', {
					controller: 'userPageController',
					template: '' + 
						'<div class="row-fluid">' +
							'<div class="span12">' +
								'<p class="lead">{{headerText}}</p>' +
							'</div>' +
						'</div>' + 
						'<div id="countercontainer" timer-list="timerListUrl" timer-list-message="message"></div>' +
						'<hr ng-if="headerTextFriends">' + 
						'<div class="row-fluid" ng-if="headerTextFriends">' +
							'<div class="span12">' +
								'<p class="lead">{{headerTextFriends}}</p>' +
							'</div>' +
						'</div>' + 
						'<div id="friendcountercontainer" timer-list="timerListFriendsUrl" timer-list-message="friendsMessage"></div>'
				})
				.otherwise({
					redirectTo: '/' // Change that!
				});
		}
	]);

timerApp.controller('userPageController', ['$scope', '$routeParams', function($scope, $routeParams) {
	$scope.headerText = $routeParams.screen_name;
	$scope.timerListUrl = '/u/' + $routeParams.screen_name;
	$scope.message = {'text': 'У пользователя нет публичных таймеров.'};
	
	$scope.headerTextFriends = 'Таймеры друзей'; //TODO: EMPTY IF PAGE USER IS NOT OWNER
	$scope.timerListFriendsUrl = '/f/' + $routeParams.screen_name;
	$scope.friendsMessage = {'text': ''};
}]);

timerApp.controller('collapsibleMenuController', ['$scope', function($scope) {
	$scope.isCollapsed = true;
}]);


/***
 *       __ _     _   
 *      / /(_)___| |_ 
 *     / / | / __| __|
 *    / /__| \__ \ |_ 
 *    \____/_|___/\__|
 *                    
 */
timerApp.factory('timerListFactory', function($http) {
	return {
		getTimerListAsync: function(url, callback) {
			$http.get(url + '/timers').success(callback);
		}
	};
});

timerApp.controller('timerListController', ['$scope', 'timerFactory', 'timerListFactory', function($scope, timerFactory, timerListFactory) {
	$scope.loading = true;
	
	var createRange = function(target) {
		return function () {
			var range = [];
			for (var i = 0; i < target.length; i = i + 3) range.push(i);
			return range;
		}
	}
	
	$scope.concat = function() {
		return Array.prototype.slice.call(arguments).join('');
	}
	
	timerListFactory.getTimerListAsync($scope.timerListUrl, function(results) {
		$scope.loading = false;
		
		if (results.length === 0) {
			$scope.timers = [];
		} else {
			$scope.timers = results;
			
		}
		$scope.timers.range = createRange($scope.timers);
	});
	
	$scope.timerListAppend = function(id, callback) {
		timerFactory.getTimerAsync(id, function(timer) {
			$scope.timers.push(timer);
			$scope.timers.range = createRange($scope.timers);
			console.log('adding to timers: ' + JSON.stringify(timer));
			callback(timer);
		})
	};
	
	$scope.removeTimerById = function(id) {
		console.log('searching timer ' + id);
		$scope.timers.forEach(function(e, i) {
			if (e.id === id) {
				console.log('removed timer with id ' + id);
				$scope.timers.splice(i, 1);
				$scope.timers.range = createRange($scope.timers);
			}
		});
	};
	
	$scope.replaceTimer = function(id, timer) {
		console.log('searching timer ' + id);
		$scope.timers.forEach(function(e, i) {
			if (e.id === id) {
				console.log('replaced timer with id ' + timer.id);
				$scope.timers[i] = timer;
			}
		});
	};
}]);

/***
 *     _____ _                     
 *    /__   (_)_ __ ___   ___ _ __ 
 *      / /\/ | '_ ` _ \ / _ \ '__|
 *     / /  | | | | | | |  __/ |   
 *     \/   |_|_| |_| |_|\___|_|   
 *                                 
 */
timerApp.factory('timerFactory', function($http, $location) {
	return {
		getTimerAsync: function(id, callback) {
			$http.get('/t/' + id + '/show').success(callback);
		},
		restartTimerAsync: function(id, callback) {
			$http.get('/t/' + id + '/restart').success(callback);
		},
		setTimerAsync: function(obj, callback) {
			$http({
				url:'/t/' + obj.id + '/set',
				method: 'GET',
				params: obj,
			}).success(callback);
		},
		removeTimerAsync: function(id, callback) {
			$http.get('/t/' + id + '/remove').success(callback);
		},
	};
});

timerApp.controller('timerController', ['$scope', '$location', 'timerFactory', function($scope, $location, timerFactory) {
	$scope.show = function(id) {
		$scope.loading = true;
		timerFactory.getTimerAsync(id, function(results) {
			$scope.loading = false;
			$scope.timer = results;
			$scope.editableTimer = $scope.timer;
			$scope.editableTimer.good = $scope.editableTimer.good ? true : false;
			$scope.editableTimer.public = $scope.editableTimer.public ? true : false;
		});
	};
	$scope.edit = function() {
		$scope.editor = true;
		$scope.editableTimer = $scope.timer;
		$scope.editableTimer.good = $scope.editableTimer.good ? true : false;
		$scope.editableTimer.public = $scope.editableTimer.public ? true : false;
		$scope.changeNameLength();
	};
	
	$scope.changeNameLength = function() {
		$scope.nameLengthLeft = 'undefined' !== typeof $scope.editableTimer.name ? $scope.nameLengthLeft = 120 - $scope.editableTimer.name.length : $scope.nameLengthLeft = '!!';
	}
	
	$scope.save = function() {
		if ($scope.editableTimer && 'undefined' !== typeof $scope.editableTimer.id) {
			$scope.loading = true;
			timerFactory.setTimerAsync($scope.editableTimer, function(results) {
				$scope.loading = false;
				$scope.timer = results;
				$scope.$parent.replaceTimer($scope.editableTimer.id, results);
				$scope.editor = false;
				if ($scope.editableTimer.id == -1) {
					console.log('trying to append new timer -1');
					$scope.$parent.timerListAppend(-1, function() {});
				}
				$scope.editableTimer = $scope.timer;
				$scope.editableTimer.good = $scope.editableTimer.good ? true : false;
				$scope.editableTimer.public = $scope.editableTimer.public ? true : false;
			});
		}
	};
	
	$scope.cancel = function() {
		$scope.editor = false;
		$scope.editableTimer = $scope.timer;
		$scope.editableTimer.good = $scope.editableTimer.good ? true : false;
		$scope.editableTimer.public = $scope.editableTimer.public ? true : false;
	};
	
	$scope.restart = function() {
		if ($scope.timer && 'undefined' !== typeof $scope.timer.id) {
			$scope.loading = true;
			timerFactory.restartTimerAsync($scope.timer.id, function(results) {
				$scope.loading = false;
				$scope.timer = results;
				$scope.editableTimer = $scope.timer;
				$scope.editableTimer.good = $scope.editableTimer.good ? true : false;
				$scope.editableTimer.public = $scope.editableTimer.public ? true : false;
			});
		}
	};
	
	$scope.remove = function() {
		if ($scope.timer && 'undefined' !== typeof $scope.timer.id) {
			$scope.loading = true;
			timerFactory.removeTimerAsync($scope.timer.id, function(results) {
				$scope.loading = false;
				console.log('removing ' + results.ok);
				if (results && results.ok) {
					console.log('trying to remove timer ' + $scope.timer.id);
					$scope.$parent.removeTimerById($scope.timer.id);
				}
			});
		}
	};
	
	$scope.getUrl = function () {
		return $location.protocol() + '://' + $location.host() + ($scope.timer && $scope.timer.owner_name ? '/u/' + $scope.timer.owner_name : '');
	}
}]);

/***
 *     _____ _                    _____ _                
 *    /__   (_)_ __ ___   ___ _ _/__   (_)_ __ ___   ___ 
 *      / /\/ | '_ ` _ \ / _ \ '__|/ /\/ | '_ ` _ \ / _ \
 *     / /  | | | | | | |  __/ |  / /  | | | | | | |  __/
 *     \/   |_|_| |_| |_|\___|_|  \/   |_|_| |_| |_|\___|
 *                                                       
 */
timerApp.factory('timerTimeFactory', function($http) {
	return {
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

timerApp.controller('timerTimeController', ['$scope', '$timeout', 'timerTimeFactory', function($scope, $timeout, timerTimeFactory) {
	var stop;
	var time = timerTimeFactory.timerGetTime($scope.lastRestart, 0, 0);
	$scope.time = time;
	
	var modTime = function() {
		time = timerTimeFactory.timerGetTime($scope.lastRestart, 0, 0);
		
		if (time.compare($scope.time) === false) {
			$scope.time = time;
		}
	}
	
	$scope.onTimeout = function() {
		modTime();
		stop = $timeout($scope.onTimeout, 1000);
	}
	stop = $timeout($scope.onTimeout, 1000);
	
	$scope.timeoutStop = function() {
		$timeout.cancel(stop);
	}
}]);

/***
 *     _____           _ _   _             __ _       _    
 *    /__   \__      _(_) |_| |_ ___ _ __ / /(_)_ __ | | __
 *      / /\/\ \ /\ / / | __| __/ _ \ '__/ / | | '_ \| |/ /
 *     / /    \ V  V /| | |_| ||  __/ | / /__| | | | |   < 
 *     \/      \_/\_/ |_|\__|\__\___|_| \____/_|_| |_|_|\_\
 *                                                         
 */
timerApp.controller('timerTwitterLinkController', ['$scope', '$window', '$location', 'timerTimeFactory', function($scope, $window, $location, timerTimeFactory) {
	$scope.getUrl = function () {
		return $location.protocol() + '://' + $location.host() + ($scope.timer && $scope.timer.owner_name ? '/u/' + $scope.timer.owner_name : '');
	}
	
	$scope.createLink = function () {
		var time = timerTimeFactory.timerGetTime($scope.timer.last_restart, 0, 0);
		var link = 'https://twitter.com/share?url=' + $scope.getUrl() + '&text=' +
			($scope.timer.owner_name ? '@' + $scope.timer.owner_name + ': ' : '') +
			$scope.timer.name + ' ' + time[0] + ' ' + time[1] + 
			(time[3] != '' ? ' ' + time[2] + ' ' + time[3] : '');
		return link;
	};
}]);

/***
 *        ___ _               _   _                
 *       /   (_)_ __ ___  ___| |_(_)_   _____  ___ 
 *      / /\ / | '__/ _ \/ __| __| \ \ / / _ \/ __|
 *     / /_//| | | |  __/ (__| |_| |\ V /  __/\__ \
 *    /___,' |_|_|  \___|\___|\__|_| \_/ \___||___/
 *                                                 
 */
timerApp
/***
 *     _____ _                     
 *    /__   (_)_ __ ___   ___ _ __ 
 *      / /\/ | '_ ` _ \ / _ \ '__|
 *     / /  | | | | | | |  __/ |   
 *     \/   |_|_| |_| |_|\___|_|   
 *                                 
 */
	.directive('timer', function() {
		return {
			restrict: 'A',
			scope: {
				timer: '=timer',
				editor: '@editor',
				elementId: '=id'
			},
			controller: 'timerController',
			template: '' +
				'<div ng-class="{' +
					'\'loading\': loading,' +
					'\'timer-good\': !timer.denied && timer.good == 1,' +
					'\'timer-bad\': !timer.denied && timer.good == 0,' +
					'\'timer-neutral\': !timer.denied && (timer.good != 1) && (timer.good != 0),' +
					'\'timer-public\': !timer.denied && timer.public == 1,' +
					'\'timer-private\': !timer.denied && timer.public == 0' +
				'}" class="span4 well timer" editor="false">' +
					/* Timer show */
					'<div ng-if="!timer.denied && timer.set" ng-hide="editor" class="icon-good"><i ng-class="{' +
						'\'icon-thumbs-up\': timer.good == 1,' +
						'\'icon-thumbs-down\': timer.good == 0,' +
						'\'icon-adjust\': (timer.good != 1) && (timer.good != 0)' +
					'}"></i></div>' +
					'<div ng-if="!timer.denied && timer.set" ng-hide="editor" class="icon-public"><i ng-class="{' +
						'\'icon-eye-open\': timer.public == 1,' +
						'\'icon-eye-close\': timer.public == 0' +
					'}"></i></div>' +
					'<div ng-if="!timer.denied && timer.set" ng-hide="editor" class="icon-name" ng-if="timer.owner_name">' +
						'<a ng-href="/u/{{timer.owner_name}}">{{timer.owner_name}}</a>' +
					'</div>' +
					'<div ng-if="!timer.denied && timer.set" ng-hide="editor" class=""><center>{{timer.name}}</center></div>' +
					'<div ng-if="!timer.denied && timer.set" ng-hide="editor" class="" id="{{elementId}}time" timer-time="timer.last_restart"></div>' + // TIME HERE
					'<div ng-if="!timer.denied && timer.set" ng-hide="editor" class=""><center>' + 
						'<a class="btn btn-danger" ng-if="timer.can_edit || timer.id == 0" ng-click="restart()"><i class="icon-white icon-repeat"></i> Сброс</a>' + 
						' <a ng-if="timer.public == 1" timer-twitter-link></a>' +
						' <a class="btn" ng-click="edit()">&nbsp;<i class="icon-pencil"></i>&nbsp;</a>' +
					'</center></div>' +
					/* Timer denied */
					'<div ng-if="timer.set && timer.denied" ng-hide="editor" class=""><center>Доступ к таймеру запрещён</center></div>' +
					/* Timer create */
					'<div ng-if="!timer.set" ng-hide="editor" class=""><p><center><h3>Создать таймер</h3></center></p></div>' +
					'<div ng-if="!timer.set" ng-hide="editor" class=""><center> <a class="btn btn-success btn-large" ng-click="edit()" ng-if="timer.id == -1"><i class="icon-white icon-plus"></i> Добавить</a></center></div>' +
					'<div ng-if="!timer.set" ng-hide="editor" class=""><p><center> </center></p></div>' +
					/* Editor */
					'<div ng-if="!timer.denied" ng-show="editor" class="icon-good"><i ng-class="{' +
						'\'icon-thumbs-up\': editableTimer.good == 1,' +
						'\'icon-thumbs-down\': editableTimer.good == 0,' +
						'\'icon-adjust\': (editableTimer.good != 1) && (editableTimer.good != 0)' +
					'}"></i></div>' +
					'<div ng-if="!timer.denied" ng-show="editor" class="icon-public"><i ng-class="{' +
						'\'icon-eye-open\': editableTimer.public == 1,' +
						'\'icon-eye-close\': editableTimer.public == 0' +
					'}"></i></div>' +
					'<div ng-show="editor">' +
						'<form class="">' +
							'<div class="input-append"><center>' +
								'<input type="text" class="span10" placeholder="Название таймера" ng-model="editableTimer.name" ng-change="changeNameLength()" ng-maxlength="120">' +
								'<span class="add-on" ng-class="{\'error\': editableTimer.name.$error.maxlength}">{{nameLengthLeft}}</span>' +
							'</center></div>' +
							'<div class=""><center>' +
								'<span ng-if="timer.id == -1" timer-date-time="editableTimer.last_restart_date">' +
									'<a class="btn" id="{{elementId}}date_link"><i class="icon-calendar"></i> Начать ранее</a>' +
								'</span>&nbsp;' +
								'<span>' +
									'<label class="checkbox inline" tooltip-html-unsafe="&lt;span class=&quot;timer-good background-good&quot;&gt;&lt;i class=&quot;icon-thumbs-up timer-good&quot;&gt;&lt;/i&gt; — хорошие события и привычки.&lt;/span&gt; Пример: «Не курю».&lt;br /&gt;&lt;span class=&quot;timer-bad background-bad&quot;&gt;&lt;i class=&quot;icon-thumbs-down timer-bad&quot;&gt;&lt;/i&gt; — плохие события или вредные привычки.&lt;/span&gt; Пример: «Не видел родителей»." tooltip-placement="bottom" tooltip-title="Позитивный">' +
									'<input type="checkbox" ng-model="editableTimer.good"> <span class="timer-good background-good"><i class="icon-thumbs-up"></i></span></label>&nbsp;' +
								'</span>' +
								'<label class="checkbox inline" tooltip-html-unsafe="&lt;i class=&quot;icon-eye-open&quot;&gt;&lt;/i&gt; — таймер виден всем посетителям страницы профиля.&lt;br /&gt;&lt;i class=&quot;icon-eye-close&quot;&gt;&lt;/i&gt; — таймер виден исключительно владельцу." tooltip-placement="bottom" tooltip-title="Виден всем">' +
								'<input type="checkbox" ng-model="editableTimer.public"> <i class="icon-eye-open"></i></label>' +
							'</center></div>' +
						'</form>' +
						'<div class=""><center>' +
							'  <a class="btn btn-success" ng-click="save()"><i class="icon-white icon-ok"></i> Сохранить</a>' +
							'  <a class="btn" ng-click="cancel()"><i class="icon-ban-circle"></i> Отмена</a>' +
							'  <a ng-if="timer.id != -1" class="btn btn-danger pull-right" ng-click="remove()">&nbsp;<i class="icon-white icon-trash"></i>&nbsp;</a>' +
						'</center></div>' +
					'</div>' +
				'</div>',
			replace: true
		};
	})
/***
 *       __ _     _   
 *      / /(_)___| |_ 
 *     / / | / __| __|
 *    / /__| \__ \ |_ 
 *    \____/_|___/\__|
 *                    
 */
	.directive('timerList', function() {
		return {
			restrict: 'A',
			scope: {
				timerListUrl: '=timerList',
				elementId: '=id',
				message: '=timerListMessage'
			},
			controller: 'timerListController',
			template: '' +
				'<div class="container-fluid counter-container" ng-class="{\'loading\': loading}">' +
					'<div ng-if="message && !loading && !timers" list-message="message"></div>' +
					'<div ng-repeat="n in timers.range()" class="row-fluid" id="concat(elementId, \'row\', $index)">' +
						'<div ng-repeat="item in timers.slice(n, n+3)" timer="item" id="concat(\'counter\', item.id)"></div>' +
					'</div>' +
				'</div>',
			replace: true
		};
	})
/***
 *     _____ _                    _____ _                
 *    /__   (_)_ __ ___   ___ _ _/__   (_)_ __ ___   ___ 
 *      / /\/ | '_ ` _ \ / _ \ '__|/ /\/ | '_ ` _ \ / _ \
 *     / /  | | | | | | |  __/ |  / /  | | | | | | |  __/
 *     \/   |_|_| |_| |_|\___|_|  \/   |_|_| |_| |_|\___|
 *                                                       
 */
	.directive('timerTime', function() {
		return {
			restrict: 'A',
			scope: {
				lastRestart: '=timerTime'
			},
			controller: 'timerTimeController',
			template: '' +
				'<div><center>' +
					'<p><center>' +
						'<h1>{{time.0}}<small> {{time.1}} {{time.2}} {{time.3}}</small></h1>' +
					'</center></p>' +
				'</center></div>',
			replace: true,
			link: function(scope, element) {
				element.bind('$destroy', function() {
					scope.timeoutStop();
				});
			}
		}
	})
/***
 *     _____           _ _   _             __ _       _    
 *    /__   \__      _(_) |_| |_ ___ _ __ / /(_)_ __ | | __
 *      / /\/\ \ /\ / / | __| __/ _ \ '__/ / | | '_ \| |/ /
 *     / /    \ V  V /| | |_| ||  __/ | / /__| | | | |   < 
 *     \/      \_/\_/ |_|\__|\__\___|_| \____/_|_| |_|_|\_\
 *                                                         
 */
	.directive('timerTwitterLink', function() {
		return {
			restrict: 'A',
			scope: true,
			controller: 'timerTwitterLinkController',
			template: '<a ng-href="{{createLink()}}" target="_blank" class="twitter-share-button btn btn-inverse"><img src="https://twitter.com/favicons/favicon.ico"> Твитнуть</a>',
			replace: true
		}
	})
/***
 *                                           
 *      /\/\   ___  ___ ___  __ _  __ _  ___ 
 *     /    \ / _ \/ __/ __|/ _` |/ _` |/ _ \
 *    / /\/\ \  __/\__ \__ \ (_| | (_| |  __/
 *    \/    \/\___||___/___/\__,_|\__, |\___|
 *                                |___/      
 */
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
    })
/***
 *        ___      _      _____ _                
 *       /   \__ _| |_ __/__   (_)_ __ ___   ___ 
 *      / /\ / _` | __/ _ \/ /\/ | '_ ` _ \ / _ \
 *     / /_// (_| | ||  __/ /  | | | | | | |  __/
 *    /___,' \__,_|\__\___\/   |_|_| |_| |_|\___|
 *                                               
 */
	.directive('timerDateTime', function() {
		return {
			restrict: 'A',
			scope: {
				lastUpdate: '=timerDateTime'
			},
			template: '' +
				'<span class="input-prepend date">' +
					'<span class="add-on"><i class="icon-th"></i></span>' +
					'<input class="span6 date-input" size="16" type="text" ng-model="lastUpdate" datepicker-popup="dd.MM.yyyy H:mm" datepicker-options="{\'starting-day\': 1}">' +
				'</span>',
		};
	});