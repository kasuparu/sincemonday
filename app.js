// Initial configuration
var express = require('express'),
    app = express(),
	env = process.env.NODE_ENV || 'dev',
	cfg = require('./config.' + env),
	fs = require('fs'),
	async = require('async'),
	everyauth = require('everyauth'),
	MongoStore = require('connect-mongo')(express),
	MongoDB = require('mongodb'),
	util = require('util'),
	sessionCookieData = {key: 'connect.sid', maxAge: 360*24*60*60*1000, signed: true, httpOnly: true},
	twitterAPI = require('node-twitter-api'),
	twitter = new twitterAPI({
		consumerKey: cfg.twit.consumerKey,
		consumerSecret: cfg.twit.consumerSecret,
		callback: '/auth/twitter/callback',
		oa: everyauth.twitter.oauth
	}),
	User = require('./classes/user')({
		MongoDB: MongoDB,
		cfg: cfg,
		twitter: twitter,
		async: async
	}),
	Timer = require('./classes/timer'),
	jsonContentType = 'application/json; charset=utf8';
	
Timer.configure({
		MongoDB: MongoDB,
		cfg: cfg,
		twitter: twitter,
		User: User,
		async: async
	});

var htmlEntities = function(str) {
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	},
	softwareBuild = '';
	
try {
	softwareBuild = fs.readFileSync(__dirname + '/software-build', 'utf8');
} catch (e) {
	if (e.code === 'ENOENT') {
		console.log('File \'/software-build\' not found.');
	} else {
		throw e;
	}
};

// Everyauth config
everyauth.debug = env == 'dev';

everyauth
	.twitter
		.consumerKey(cfg.twit.consumerKey)
		.consumerSecret(cfg.twit.consumerSecret)
		.findOrCreateUser(function (sess, accessToken, accessSecret, twitUser) {
			var promise = this.Promise();
			User.findOrCreateUser('twitter', accessToken, accessSecret, twitUser, function(err, user) {
				if (err) return promise.fail(err);
				promise.fulfill(user);
			});
			return promise;
		})
		.entryPath('/auth/twitter')
		.callbackPath('/auth/twitter/callback')
		.redirectPath('/me');

everyauth.everymodule
	.findUserById(function (id, callback) {
		User.findById(id, callback);
	});

// Session config
sessionTestingMiddleware = function(req, res, next) {
	req.session.value = (req.session.value || 0) + 1;
	req.session.time = new Date();
	next();
};

// App
app.configure(function(){
	app	.use(express.logger())
		.use(function(req, res, next) {
			res.setHeader("Access-Control-Allow-Origin", "*");
			return next();
		})
		.use(express.favicon(__dirname + '/static/favicon.ico'))
		.use(express.static(__dirname + '/static'))
		.use(express.bodyParser())
		.use(express.cookieParser(cfg.session.secret))
		.use(express.session({
			store: new MongoStore({
				url: cfg.mongo.uri + '/' + cfg.mongo.db,
				auto_reconnect: true
			}),
			secret: cfg.session.secret,
			cookie: sessionCookieData
		}))
		.use(everyauth.middleware())
		.use(express.csrf())
		.use(sessionTestingMiddleware)
		.use(app.router)
		.set('view engine', 'ejs');
		
	app.enable('trust proxy');
});

// Pages
app.get('/', function(req, res) {
	res.render('ng', {
		user: (req.session.auth && req.session.auth.twitter && req.session.auth.twitter.user) ? req.session.auth.twitter.user : {},
		siteName: cfg.siteName,
		softwareBuild: softwareBuild,
		htmlEntities: htmlEntities,
		activePage: 'about'
	});
});

app.get('/me', function(req, res) {
	if(req.session.auth && req.session.auth.twitter && req.session.auth.twitter.user) {
		userName = req.session.auth.twitter.user.screen_name;
	} else {
		userName = '';
	}
	res.redirect(userName ? '/#!/u/' + userName : '/');
});

app.get('/embed-test', function(req, res) {
	res.render('embed-test', {
		siteName: cfg.siteName
	});
});

// API
app.get('/t/:id(-?\\d+)/show', function(req, res) {
    res.setHeader('content-type', jsonContentType);
	if (req.params.id != 'undefined' && !isNaN(req.params.id)) {
		Timer.findById(parseInt(req.params.id), function(err, timer) {
			if (!err && timer) {
				if(req.session.auth && req.session.auth.twitter && req.session.auth.twitter.user) {
					userId = req.session.auth.twitter.user.id;
				} else {
					userId = -1;
				}
				
				if (timer.viewAllowed(userId)) {
					if (timer.editAllowed(userId)) {
						timer.showJsonCanEdit(function(err, timer) {
							res.send(err || timer);
						});
						
					} else {
						timer.showJson(function(err, timer) {
							res.send(err || timer);
						});
					}
				} else {
					timer.showJsonDenied(function(err, timer) {
						res.send(err || timer);
					});
				}
			} else {
				res.send(err);
			}
		});
	};
});

app.get('/t/:id(\\d+)/restart', function(req, res) {
    res.setHeader('content-type', jsonContentType);
	if (req.params.id != 'undefined' && !isNaN(req.params.id)) {
		Timer.findById(parseInt(req.params.id), function(err, timer) {
			if (!err && timer) {
				if(req.session.auth && req.session.auth.twitter && req.session.auth.twitter.user) {
					userId = req.session.auth.twitter.user.id;
				} else {
					userId = -1;
				}
				
				if (timer.restartAllowed(userId)) {
					timer.restart(function(err, timer) {
						if (!err && timer) {
							if (timer.editAllowed(userId)) {
								timer.showJsonCanEdit(function(err, timer) {
									res.send(err || timer);
								});
								
							} else {
								timer.showJson(function(err, timer) {
									res.send(err || timer);
								});
							}
						} else {
							res.send({ok: 0});
						}
					});

				} else {
					res.send({ok: 0});
				}
			} else {
				res.send({ok: 0});
			}
		});
	};
});

app.get('/t/:id(\\d+)/remove', function(req, res) {
    res.setHeader('content-type', jsonContentType);
	if (req.params.id != 'undefined' && !isNaN(req.params.id)) {
		Timer.findById(parseInt(req.params.id), function(err, timer) {
			if (!err && timer) {
				if(req.session.auth && req.session.auth.twitter && req.session.auth.twitter.user) {
					userId = req.session.auth.twitter.user.id;
				} else {
					userId = -1;
				}
				
				if (timer.editAllowed(userId)) {
					timer.remove(timer, function(err, timer) {
						if (!err && timer) {
							res.send({ok: 1});
						} else {
							res.send({ok: 0});
						}
					});

				} else {
					res.send({ok: 0});
				}
			} else {
				res.send({ok: 0});
			}
		});
	};
});

app.get('/t/:id(-?\\d+)/set', function(req, res) {
    res.setHeader('content-type', jsonContentType);
	if (req.params.id != 'undefined' && !isNaN(req.params.id)) {
		Timer.findById(parseInt(req.params.id), function(err, timer) {
			if (!err && timer) {
				if(req.session.auth && req.session.auth.twitter && req.session.auth.twitter.user) {
					userId = req.session.auth.twitter.user.id;
				} else {
					userId = -1;
				}
				
				if (timer.editAllowed(userId)) {
					var label = req.query.name;
					var goodVal = req.query.good;
					var publicVal = req.query.public;
					if (parseInt(req.query.id) == -1) {
						if (typeof req.query.last_restart != 'undefined' && req.query.last_restart && req.query.last_restart != '-1' && !isNaN(parseInt(req.query.last_restart))) {
							var last_restart = parseInt(req.query.last_restart);
							var date_selected = 1;
						} else {
							var last_restart = Math.round(new Date().getTime() / 1000);
							var date_selected = 0;
						}
					} else {
						var last_restart = -1;
					}
					timer.setProps(label, userId, last_restart, date_selected);
					timer.setGood(goodVal);
					timer.setPublic(publicVal);
					timer.save(function(err, timer) {
						if (!err && timer) {
							timer.showJsonCanEdit(function(err, timer) {
								res.send(err || timer);
							});
						} else {
							res.send({});
						}
					});
				} else {
					res.send({});
				}
			} else {
				res.send({});
			}
		});
	};
});

app.get('/u/random/:action(list|timers)', function(req, res) {
    res.setHeader('content-type', jsonContentType);
	var action = req.params.action == 'list' ? 'getHandle' : 'getHandleTimers';
	
	Timer[action]('about_3random', function(err, handle) {
		if (handle) {
			res.send(action == 'list' ? handle.ids : handle);
		} else {
			res.send([]);
		}
		
	});
});

app.get('/:handle(u|f)/:screen_name/:action(list|timers)', function(req, res) {
    res.setHeader('content-type', jsonContentType);
	if(req.session.auth && req.session.auth.twitter && req.session.auth.twitter.user) {
		userId = req.session.auth.twitter.user.id;
	} else {
		userId = -1;
	}
	
	User.findByName(req.params.screen_name, function(owner) {
		if (owner) {
			var action = req.params.action == 'list' ? 'timerList' : 'timers';
			if (req.params.handle == 'f') {
				action += 'Friends';
			}
			User[action](owner, userId, function(err, timerList) {
				if (!err && timerList) {
					res.send(timerList);
				} else {
					res.send([]);
				}
			});
		} else {
			res.send([]);
		}
	});
});

app.get('/r/:screen_name/list', function(req, res) {
    res.setHeader('content-type', jsonContentType);
	if(req.session.auth && req.session.auth.twitter && req.session.auth.twitter.user) {
		userId = req.session.auth.twitter.user.id;
	} else {
		userId = -1;
	}
	
	User.findByName(req.params.screen_name, function(owner) {
		if (owner && owner.id && userId == owner.id) {
			User.checkUpdateTwitterFriendsAndFollowers(owner, function(err, user) {
				if (!err && user) {
					res.send(user.relationships || []);
				} else {
					res.send([]);
				}
			});
		} else {
			res.send([]);
		}
	});
});

app.listen(cfg.httpPort);
console.log('Express server started on port %s', cfg.httpPort);

module.exports = app;
