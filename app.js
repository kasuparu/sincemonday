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
		twitter: twitter
	}),
	Timer = require('./classes/timer'),
	jsonContentType = 'application/json; charset=utf8';
	
	Timer.configure({
		MongoDB: MongoDB,
		cfg: cfg,
		twitter: twitter,
		User: User,
		async: async
	}),
	htmlEntities = function(str) {
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
			//console.log('everyauth called twitter findOrCreateUser');
			var promise = this.Promise();
			User.findOrCreateUser('twitter', accessToken, accessSecret, twitUser, function(err, user) {
				if (err) return promise.fail(err);
				promise.fulfill(user);
			});
			return promise;
		})
		.entryPath('/auth/twitter')
		.callbackPath('/auth/twitter/callback')
		.redirectPath('/');

everyauth.everymodule
	.findUserById(function (id, callback) {
		//console.log('everyauth called findUserById');
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

app.get('/', function(req, res) {
	res.render('about', {
		user: (req.session.auth && req.session.auth.twitter && req.session.auth.twitter.user) ? req.session.auth.twitter.user : {},
		siteName: cfg.siteName,
		softwareBuild: softwareBuild,
		htmlEntities: htmlEntities,
		activePage: 'about'
	});
	
});

app.get('/db', function(req, res) {
	/*User.findById(330157333, function(user) { // No err here!
		if (user) {
			res.setHeader('content-type', jsonContentType);
			res.send(JSON.stringify(user));
		}
	});
	*/
	Timer.getNextId(function(err, maxId) {
		res.setHeader('content-type', jsonContentType);
		res.send(JSON.stringify(maxId));
	});
	
});

app.get('/t/:id(\\d+)/show', function(req, res) {
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

app.get('/u/random/list', function(req, res) {
    res.setHeader('content-type', jsonContentType);
	Timer.getHandle('about_3random', function(err, handle) {
		if (handle) {
			var nowTimestamp = Math.round(new Date().getTime() / 1000);
			res.send(handle.ids);
		} else {
			res.send([]);
		}
		
	});
});

app.get('/u/:screen_name/list', function(req, res) {
    res.setHeader('content-type', jsonContentType);
	if(req.session.auth && req.session.auth.twitter && req.session.auth.twitter.user) {
		userId = req.session.auth.twitter.user.id;
	} else {
		userId = -1;
	}
	
	User.findByName(req.params.screen_name, function(owner) {
		if (owner) {
			User.timerList(owner.id, userId, function(err, timerList) {
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

app.get('/f/:screen_name/list', function(req, res) {
    res.setHeader('content-type', jsonContentType);
	if(req.session.auth && req.session.auth.twitter && req.session.auth.twitter.user) {
		userId = req.session.auth.twitter.user.id;
	} else {
		userId = -1;
	}
	
	User.findByName(req.params.screen_name, function(owner) {
		if (owner) {
			User.timerListFriends(owner, userId, function(err, timerList) {
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

app.get('/f/:screen_name/show', function(req, res) {
    res.setHeader('content-type', jsonContentType);
	if(req.session.auth && req.session.auth.twitter && req.session.auth.twitter.user) {
		userId = req.session.auth.twitter.user.id;
	} else {
		userId = -1;
	}
	
	User.findByName(req.params.screen_name, function(owner) {
		if (owner && owner.id == userId) {
			res.send(owner.friends_ids);
		} else {
			res.send([]);
		}
	});
});

app.get('/u/:screen_name', function(req, res) {
    User.findByName(req.params.screen_name, function(owner) {
		res.render('user', {
			owner: owner,
			user: (req.session.auth && req.session.auth.twitter && req.session.auth.twitter.user) ? req.session.auth.twitter.user : {},
			siteName: cfg.siteName,
			softwareBuild: softwareBuild,
			htmlEntities: htmlEntities,
			activePage: 'user'
		});
	});
	
});

app.listen(cfg.httpPort);
console.log('Express server started on port %s', cfg.httpPort);

module.exports = app;
