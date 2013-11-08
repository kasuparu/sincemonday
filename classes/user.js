var usersById = {};
var nextUserId = 0;
var usersByTwitId = {};

var User = function (opts) {
	opts = (opts === Object(opts)) ? opts : {};

    if (!(this instanceof User)) {
        return new User(opts);
    }

    for (var key in opts) if ({}.hasOwnProperty.call(opts, key)) {
        this.config[key] = opts[key];
    }
}

User.prototype.config = {};

User.prototype.findOrCreateUser = function(source, oauthUser, accessToken, accessSecret, callback) {
	this.config.MongoDB.MongoClient.connect(this.config.cfg.mongo.uri + '/' + this.config.cfg.mongo.db, function(err, db) {
		if (err) return callback(err, null);
		db.collection('users').findOne({'id': oauthUser.id}, function(err, user) {
			if (err) return callback(err, null);
			
			if (!user) {
				user = {
					_id: new this.config.MongoDB.ObjectID(),
					friends_ids: []
				};
			}
			
			user.id = oauthUser.id;
			user.source = source;
			user.logged_in = oauthUser.logged_in;
			user.ot = accessToken;
			user.ots = accessSecret;
			
			db.collection('users').update({id: user.id}, {$set: user}, {safe: true, upsert:true}, function(err){
				if (err) return callback(err, null);
				db.close();
				callback(err, user);
			});
		});
    });
}

User.prototype.findById = function(id, callback) {
	console.log('User called findById');
	// TODO: really find the user
	callback(usersById[id]);
}
	
User.prototype.add = function(source, sourceUser, callback) {
	console.log('User called add');
	// TODO: really add the user to the store
	var user;
	if (arguments.length === 1) { // password-based
		user = sourceUser = source;
		user.id = ++nextUserId;
		return usersById[nextUserId] = user;
	} else { // non-password-based
		user = usersById[++nextUserId] = {id: nextUserId};
		user[source] = sourceUser;
	}
	
	//callback(user);
	return user;
}

module.exports = exports = User;