// Initial configuration
var express = require('express'),
    app = express(),
	env = process.env.NODE_ENV || 'dev',
	cfg = require('./config.' + env),
	everyauth = require('everyauth'),
	MongoStore = require('connect-mongo')(express),
	MongoDB = require('mongodb'),
	MongoClient = MongoDB.MongoClient,
	sessionCookieName = 'connect.sid',
	sessionCookieOptions = {maxAge: 360*24*60*60*1000, signed: true, httpOnly: true},
	User = require('./classes/user')({
		MongoDB: MongoDB,
		cfg: cfg
	});

// Everyauth config
everyauth.debug = env == 'dev';

var usersById = {};
var nextUserId = 0;
var usersByTwitId = {};
/*var usersByLogin = {
  'test@example.com': addUser({ login: 'test@example.com', password: 'password'})
};*/

everyauth
	.twitter
		.consumerKey(cfg.twit.consumerKey)
		.consumerSecret(cfg.twit.consumerSecret)
		.findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
			console.log('everyauth called twitter findOrCreateUser');
			var promise = this.Promise();
			//usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
			//User.findOrCreateUser('twitter', twitUser, promise);
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
	.findUserById( function (id, callback) {
		console.log('everyauth called findUserById');
		callback(null, User.findById(id));
	});
	
/*function addUser(source, sourceUser) {
	return User.add(source, sourceUser);
}*/

// App run
sessionCookieData = sessionCookieOptions;
sessionCookieData.key = sessionCookieName;

app.configure(function(){
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
});


app.get('/', function(req, res) {
	var previous = req.session.value || 0;
	req.session.value = previous + 1;
	req.session.time = new Date();
	
    res.send('Hello, ' + JSON.stringify(req.user) + ' ' + JSON.stringify(req.session) + ' counter=' + previous + ' cookies: ' + JSON.stringify(req.signedCookies[sessionCookieName]) + ' '  + JSON.stringify(req.cookies[sessionCookieName]));
	
});

app.get('/db', function(req, res) {
    console.log(cfg.mongo.uri + '/' + cfg.mongo.db);
    /*MongoClient.connect(cfg.mongo.uri + '/' + cfg.mongo.db, function(err, db){
		if(err) throw err;
		db.collection('users').findOne(function(err, user){
			if(err) throw err;
			res.setHeader('content-type', 'application/json');
			res.send(JSON.stringify(user));
			db.close();
		});
    });*/
	oauthUser = {"id":330157333,"id_str":"330157333","name":"kasuparu","screen_name":"kasuparu","location":"Neverland","description":"Wizard, True Neutral. Currently running with cursor.","url":"http://t.co/I60jDPRRS6","entities":{"url":{"urls":[{"url":"http://t.co/I60jDPRRS6","expanded_url":"http://about.me/kasuparu","display_url":"about.me/kasuparu","indices":[0,22]}]},"description":{"urls":[]}},"protected":false,"followers_count":55,"friends_count":67,"listed_count":1,"created_at":"Wed Jul 06 05:47:00 +0000 2011","favourites_count":8,"utc_offset":7200,"time_zone":"Kyiv","geo_enabled":false,"verified":false,"statuses_count":10292,"lang":"ru","status":{"created_at":"Fri Nov 08 11:56:15 +0000 2013","id":398781006695911400,"id_str":"398781006695911424","text":"@ScrapDnB @YakivGluck ?? ????? ?????, ??? ???????.","source":"<a href=\"https://play.google.com/store/apps/details?id=org.mariotaku.twidere\" rel=\"nofollow\">Twidere for Android</a>","truncated":false,"in_reply_to_status_id":398780547893571600,"in_reply_to_status_id_str":"398780547893571585","in_reply_to_user_id":78528533,"in_reply_to_user_id_str":"78528533","in_reply_to_screen_name":"ScrapDnB","geo":null,"coordinates":null,"place":null,"contributors":null,"retweet_count":0,"favorite_count":0,"entities":{"hashtags":[],"symbols":[],"urls":[],"user_mentions":[{"screen_name":"ScrapDnB","name":"??????????? ?????","id":78528533,"id_str":"78528533","indices":[0,9]},{"screen_name":"YakivGluck","name":"Glück","id":64792357,"id_str":"64792357","indices":[10,21]}]},"favorited":false,"retweeted":false,"lang":"ru"},"contributors_enabled":false,"is_translator":false,"profile_background_color":"203454","profile_background_image_url":"http://a0.twimg.com/profile_background_images/660991076/4dn7ecrtjyjwm2vpbaya.png","profile_background_image_url_https":"https://si0.twimg.com/profile_background_images/660991076/4dn7ecrtjyjwm2vpbaya.png","profile_background_tile":true,"profile_image_url":"http://pbs.twimg.com/profile_images/378800000370819876/48d012117dea7153db49b4833bb41012_normal.png","profile_image_url_https":"https://pbs.twimg.com/profile_images/378800000370819876/48d012117dea7153db49b4833bb41012_normal.png","profile_link_color":"BB0606","profile_sidebar_border_color":"DFDFDF","profile_sidebar_fill_color":"F3F3F3","profile_text_color":"333333","profile_use_background_image":true,"default_profile":false,"default_profile_image":false,"following":false,"follow_request_sent":false,"notifications":false}
	accessToken = 'b0YOd37SSTsoEZKfWTFlMz37WsdvwYImPQyUVXT0';
	accessSecret = 'Odt5fXUqXzmMjAs2fFWWE5j9wOgnSu5ezLmv6CBOf8k';
	
	User.findOrCreateUser('twitter', oauthUser, accessToken, accessSecret, function(err, user) {
		if(user) {
			res.setHeader('content-type', 'application/json');
			res.send(JSON.stringify(user));
		}
		
	});
	
	
});

app.listen(cfg.httpPort);
console.log('Express server started on port %s', cfg.httpPort);

module.exports = app;
