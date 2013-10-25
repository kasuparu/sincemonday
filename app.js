// Initial configuration
var express = require('express'),
    app = express(),
	env = process.env.NODE_ENV || 'dev',
	cfg = require('./config.' + env),
	everyauth = require('everyauth'),
	MongoStore = require('connect-mongo')(express),
	MongoClient = require('mongodb').MongoClient;

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
			return usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
		})
		.entryPath('/auth/twitter')
		.callbackPath('/auth/twitter/callback')
		.redirectPath('/');

everyauth.everymodule
	.findUserById( function (id, callback) {
		callback(null, usersById[id]);
	});
	
function addUser (source, sourceUser) {
	var user;
	if (arguments.length === 1) { // password-based
		user = sourceUser = source;
		user.id = ++nextUserId;
		return usersById[nextUserId] = user;
	} else { // non-password-based
		user = usersById[++nextUserId] = {id: nextUserId};
		user[source] = sourceUser;
	}
	return user;
}

// App run
app.use(express.logger())
	.use(express.favicon())
	.use(express.bodyParser())
	.use(express.cookieParser(cfg.session.secret))
	.use(express.session({
		store: new MongoStore({
			url: cfg.mongo.uri + '/' + cfg.mongo.db,
			auto_reconnect: true,
			maxAge: 360*24*60*60*1000
		}),
		secret: cfg.session.secret,
		/*cookie: { 
			secure: true,
			maxAge: 360*24*60*60*1000,
		}*/
		// Uncomment = session reset each time
	}))
	.use(everyauth.middleware(app))
	.use(app.router)
	.use(express.csrf())
	.use(express.static(__dirname + '/static'));
	
app.enable('trust proxy');

app.get('/', function(req, res) {
	var previous      = req.session.value || 0;
	req.session.value = previous + 1;
	//req.session.cookie.maxAge = 360*24*60*60*1000;
    res.send('Hello, ' + JSON.stringify(req.user) + ' ' + JSON.stringify(req.cookies) + ' counter=' + previous + ' expires in: ' + (req.session.cookie.maxAge / 1000));
	
});

app.listen(cfg.httpPort);
console.log('Express server started on port %s', cfg.httpPort);

module.exports = app;
