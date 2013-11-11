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
	this.config.MongoDB.MongoClient.connect(this.config.cfg.mongo.uri + '/' + this.config.cfg.mongo.db + (this.config.cfg.mongo.options || ''), function(err, db) {
		if (err) return callback(err, null);
		db.collection('users').findOne({'id': oauthUser.id}, function(err, user) {
			if (err) return callback(err, null);
			
			if (!user) {
				user = {
					_id: new this.config.MongoDB.ObjectID(),
					friends_ids: []
				};
			} else {
				delete user._id;
			}
			
			user.id = oauthUser.id;
			user.source = source;
			user.logged_in = oauthUser.logged_in;
			user.ot = accessToken;
			user.ots = accessSecret;
			
			db.collection('users').findAndModify({id: user.id}, {}, {$set: user}, {safe: true, upsert:true}, function(err, user) {
				if (err) return callback(err, null);
				callback(err, user);
				db.close();
			});
		});
    });
}

User.prototype.findById = function(id, callback) {
	console.log('User called findById');
	this.config.MongoDB.MongoClient.connect(this.config.cfg.mongo.uri + '/' + this.config.cfg.mongo.db + (this.config.cfg.mongo.options || ''), function(err, db) {
		if (err) return callback(err, null);
		db.collection('users').findOne({id: id}, function(err, user) {
			if (err) return callback(null);
			callback(user);
			db.close();
		});
    });
}

User.prototype.updateTwitterFriends = function(id, accessToken, accessTokenSecret, callback) {
	console.log('User called updateTwitterFriends');
	var _MongoDB = this.config.MongoDB;
	var _cfg = this.config.cfg;
	this.config.twitter.friends('ids', '', accessToken, accessTokenSecret, function(err, data, response) {
		if (err) {
			console.log(err);
		} else {
			if (data && data.hasOwnProperty('ids') && data.ids instanceof Array) {
				
				friendsIds = data.ids;
				
				_MongoDB.MongoClient.connect(_cfg.mongo.uri + '/' + _cfg.mongo.db + (_cfg.mongo.options || ''), function(err, db) {
					
					if (err) return callback(err, null);
					
					db.collection('users').findAndModify({id: id}, {}, {$set: {friends_ids: friendsIds}}, {safe: true, new: true}, function(err, user) {
						if (err) return callback(err, null);
						callback(err, user);
						db.close();
					});
				});
			}
		}
	});
	
}

module.exports = exports = User;