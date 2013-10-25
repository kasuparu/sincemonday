var config = module.exports = {};

config.env = 'sample';
config.hostname = 'dev.example.com';
config.httpPort = 3000;

//mongo database
config.mongo = {};
config.mongo.uri = process.env.MONGO_URI || 'localhost';
config.mongo.db = 'example_dev';

//twitter auth
config.twit = {};
config.twit.consumerKey = 'YOUR-TWITTER-CONSUMER-KEY';
config.twit.consumerSecret = 'YOUR-TWITTER-CONSUMER-SECRET';
