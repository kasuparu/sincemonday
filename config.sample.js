var config = module.exports = {};

config.env = 'sample';
config.hostname = 'dev.example.com';
config.httpPort = 3000;

config.session = {};
config.session.secret = 'c7657903af8c8b692594';

config.siteName = 'SinceMonday';

//mongo database
config.mongo = {};
config.mongo.uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
config.mongo.db = 'example_dev';
config.mongo.options = {
	connectTimeoutMS: 5000,
	socketTimeoutMS: 5000
};

if (Object.getOwnPropertyNames(config.mongo.options).length > 0) {
	var str = '';
	for (var key in config.mongo.options) {
		if (str != "") {
			str += "&";
		}
		str += key + "=" + config.mongo.options[key];
	}
	config.mongo.options = '?' + str;
}

//twitter auth
config.twit = {};
config.twit.consumerKey = 'YOUR-TWITTER-CONSUMER-KEY';
config.twit.consumerSecret = 'YOUR-TWITTER-CONSUMER-SECRET';
