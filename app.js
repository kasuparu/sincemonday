// Initial configuration
var express = require('express'),
    app = express(),
	env = process.env.NODE_ENV || 'dev',
	cfg = require('./config.' + env),
	everyauth = require('everyauth'),
	MongoStore = require('connect-mongo')(express),
	MongoClient = require('mongodb').MongoClient,
	sessionCookieName = 'connect.sid',
	sessionCookieOptions = {maxAge: 360*24*60*60*1000, signed: true, httpOnly: true},
	User = require('./classes/user');

// Everyauth config
everyauth.debug = env == 'dev';

var usersById = {};
var nextUserId = 0;
var usersByTwitId = {};
var usersByLogin = {
  'test@example.com': addUser({ login: 'test@example.com', password: 'password'})
};

everyauth
	.twitter
		.consumerKey(cfg.twit.consumerKey)
		.consumerSecret(cfg.twit.consumerSecret)
		.findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
			// TODO: get user from db or insert it
			console.log('everyauth called twitter findOrCreateUser');
			return usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
		})
		.entryPath('/auth/twitter')
		.callbackPath('/auth/twitter/callback')
		.redirectPath('/');

everyauth.everymodule
	.findUserById( function (id, callback) {
		console.log('everyauth called findUserById');
		callback(null, User.findById(id));
	});
	
function addUser(source, sourceUser) {
	return User.add(source, sourceUser);
}

// App run
sessionCookieData = sessionCookieOptions;
sessionCookieData.key = sessionCookieName;

app.use(express.logger())
	.use(express.static(__dirname + '/static'))
	.use(express.favicon())
	.use(express.bodyParser())
	.use(express.cookieParser(cfg.session.secret))
	.use(express.session({
		store: new MongoStore({
			url: cfg.mongo.uri + '/' + cfg.mongo.db,
			auto_reconnect: true,
		}),
		secret: cfg.session.secret,
		cookie: sessionCookieData
	}))
	.use(everyauth.middleware())
	.use(express.csrf())
	.use(function(req, res, next) {
		console.log(JSON.stringify(req.session));
		next();
	})
	.use(app.router);
	
app.enable('trust proxy');

app.get('/', function(req, res) {
	var previous = req.session.value || 0;
	req.session.value = previous + 1;
	req.session.time = new Date();
	
    res.send('Hello, ' + JSON.stringify(req.user) + ' ' + JSON.stringify(req.session) + ' counter=' + previous + ' cookies: ' + JSON.stringify(req.signedCookies[sessionCookieName]) + ' '  + JSON.stringify(req.cookies[sessionCookieName]));
	
});

app.listen(cfg.httpPort);
console.log('Express server started on port %s', cfg.httpPort);

module.exports = app;
