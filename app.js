// Initial configuration
var express = require('express'),
    app = express(),
	env = process.env.NODE_ENV || 'dev',
	cfg = require('./config.' + env),
	everyauth = require('everyauth');

// Everyauth config
everyauth.debug = env == 'dev';

var usersById = {};
var nextUserId = 0;
usersByTwitId = {};
var usersByLogin = {
  'test@example.com': addUser({ login: 'test@example.com', password: 'password'})
};

everyauth
	.twitter
		.consumerKey(cfg.twit.consumerKey)
		.consumerSecret(cfg.twit.consumerSecret)
		.findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
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

var usersByLogin = {
  'brian@example.com': addUser({ login: 'brian@example.com', password: 'password'})
};

// App run
app.use(express.logger())
	.use(express.static(__dirname + '/static'))
	.use(express.favicon())
	.use(express.bodyParser())
	.use(express.cookieParser('sincemonday'))
	.use(express.session())
	.use(everyauth.middleware())
	.use(app.router);

app.get('/', function(req, res) {
    res.send('Hello World, ' + req.user);
});

app.listen(cfg.httpPort);
console.log('Express server started on port %s', cfg.httpPort);

module.exports = app;
