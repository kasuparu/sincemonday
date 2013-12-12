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

User.prototype.findOrCreateUser = function(source, accessToken, accessSecret, oauthUser, callback) {
	target = this;
	this.config.MongoDB.MongoClient.connect(this.config.cfg.mongo.uri + '/' + this.config.cfg.mongo.db + (this.config.cfg.mongo.options || ''), function(err, db) {
		if (err) return callback(err, null);
		db.collection('users').findOne({id: oauthUser.id}, function(err, user) {
			if (err) return callback(err, null);
			
			if (!user) {
				user = {
					//_id: new target.config.MongoDB.ObjectID(),
					friends_ids: []
				};
			} else {
				delete user._id;
			}
			
			user.id = oauthUser.id;
			user.source = source;
			user.logged_in = oauthUser.logged_in || oauthUser.screen_name;
			user.ot = accessToken;
			user.ots = accessSecret;
			
			db.collection('users').findAndModify({id: user.id}, {}, {$set: user}, {safe: true, upsert:true}, function(err, user) {
				if (err) return callback(err, null);
				target.checkUpdateTwitterFriends(user, function() {});
				callback(err, user);
				db.close();
			});
		});
    });
}

User.prototype.findById = function(id, callback) {
	this.config.MongoDB.MongoClient.connect(this.config.cfg.mongo.uri + '/' + this.config.cfg.mongo.db + (this.config.cfg.mongo.options || ''), function(err, db) {
		if (err) return callback(null);
		db.collection('users').findOne({id: id}, function(err, user) {
			if (err) return callback(null);
			callback(user);
			db.close();
		});
    });
}

User.prototype.checkUpdateTwitterFriends = function(user, callback) {
	var oldEnoughInSeconds = 86400; // 86400
	if (user && user.id && user.ot && user.ots) {
		console.log('checking need for updating friends of ' + user.id);
		if (!user.friends_ids_timestamp || (Math.round(new Date().getTime() / 1000) - user.friends_ids_timestamp > oldEnoughInSeconds)) {
			this.updateTwitterFriends(user.id, user.ot, user.ots, callback);
		}
	};
}

User.prototype.updateTwitterFriends = function(id, accessToken, accessTokenSecret, callback) {
	var _MongoDB = this.config.MongoDB;
	var _cfg = this.config.cfg;
	console.log('updating friends of ' + id);
	this.config.twitter.friends('ids', '', accessToken, accessTokenSecret, function(err, data, response) {
		if (err) {
			console.log(err);
		} else {
			if (data && data.hasOwnProperty('ids') && data.ids instanceof Array) {
				
				friendsIds = data.ids;
				
				_MongoDB.MongoClient.connect(_cfg.mongo.uri + '/' + _cfg.mongo.db + (_cfg.mongo.options || ''), function(err, db) {
					
					if (err) return callback(err, null);
					
					db.collection('users').findAndModify({id: id}, {}, {$set: {friends_ids: friendsIds, friends_ids_timestamp: Math.round(new Date().getTime() / 1000)}}, {safe: true, new: true}, function(err, user) {
						if (err) return callback(err, null);
						callback(err, user);
						db.close();
					});
				});
			}
		}
	});
}

User.prototype.findByName = function(screenName, callback) {
	this.config.MongoDB.MongoClient.connect(this.config.cfg.mongo.uri + '/' + this.config.cfg.mongo.db + (this.config.cfg.mongo.options || ''), function(err, db) {
		if (err) return callback(null);
		db.collection('users').findOne({logged_in: screenName}, function(err, user) {
			if (err) return callback(null);
			callback(user);
			db.close();
		});
    });
}

User.prototype.timerList = function(owner, userId, callback) {
	if (typeof owner != 'undefined' && owner && owner.id) {
		if (owner.id == userId) {
			var query = {
				owner: owner.id,
				removed: 0,
			};
		} else {
			var query = {
				owner: owner.id,
				removed: 0,
				public: 1
			};
		}
		var timerList = [];
		this.config.MongoDB.MongoClient.connect(this.config.cfg.mongo.uri + '/' + this.config.cfg.mongo.db + (this.config.cfg.mongo.options || ''), function(err, db) {
			if (err) return callback(null);
			var cursor = db.collection('timers').find(query).sort('last_restart');
			cursor.each(function(err, timer) {
				if (!err && timer) {
					timerList.push(timer.id);
				}
				if (timer == null) {
					if (owner.id == userId) {
						timerList.push(-1);
					}
					callback(null, timerList);
					db.close();
				}
			});
		});
	} else {
		callback(null, []);
	}
}

User.prototype.timerListFriends = function(owner, userId, callback) {
	if (typeof owner != 'undefined' && owner && owner.id == userId) {
		var query = {
			owner: {$in: owner.friends_ids},
			removed: 0,
			public: 1
		};
		var timerList = [];
		this.config.MongoDB.MongoClient.connect(this.config.cfg.mongo.uri + '/' + this.config.cfg.mongo.db + (this.config.cfg.mongo.options || ''), function(err, db) {
			if (err) return callback(null);
			var cursor = db.collection('timers').find(query).sort('last_restart');
			cursor.each(function(err, timer) {
				if (!err && timer) {
					timerList.push(timer.id);
				}
				if (timer == null) {
					callback(null, timerList);
					db.close();
				}
			});
		});
	} else {
		callback(null, []);
	}
}

User.prototype.timers = function(owner, userId, callback) {
	if (typeof owner != 'undefined' && owner && owner.id) {
		if (owner.id == userId) {
			var query = {
				owner: owner.id,
				removed: 0,
			};
		} else {
			var query = {
				owner: owner.id,
				removed: 0,
				public: 1
			};
		}
		var timerList = [];
		this.config.MongoDB.MongoClient.connect(this.config.cfg.mongo.uri + '/' + this.config.cfg.mongo.db + (this.config.cfg.mongo.options || ''), function(err, db) {
			if (err) return callback(null);
			var cursor = db.collection('timers').find(query).sort('last_restart');
			cursor.each(function(err, timer) {
				if (!err && timer) {
					timer.set = 1;
					timer.owner_name = owner.logged_in || owner.screen_name;
					timer.can_edit = owner.id == userId ? 1 : 0;
					timerList.push(timer);
				}
				if (timer == null) {
					if (owner.id == userId) {
						timerList.push({id: -1});
					}
					callback(null, timerList);
					db.close();
				}
			});
		});
	} else {
		callback(null, []);
	}
}

User.prototype.timersFriends = function(owner, userId, callback) {
	if (typeof owner != 'undefined' && owner && owner.id == userId) {
		var query = {
			owner: {$in: owner.friends_ids},
			removed: 0,
			public: 1
		};
		var timerList = [];
		var target = this;
		this.config.MongoDB.MongoClient.connect(this.config.cfg.mongo.uri + '/' + this.config.cfg.mongo.db + (this.config.cfg.mongo.options || ''), function(err, db) {
			if (err) return callback(null);
			var cursor = db.collection('timers').find(query).sort('last_restart');
			cursor.each(function(err, timer) {
				if (!err && timer) {
					timer.set = 1
					timerList.push(timer);
				}
				if (timer == null) {
					target.timerListFillNames(timerList, callback);
					//callback(null, timerList);
					db.close();
				}
			});
		});
	} else {
		callback(null, []);
	}
}

User.prototype.timerListFillNames = function(timerList, callback) {
	// Get owner id list as hash keys
	var ownerIds = [];
	timerList.forEach(function(v) {
		if (ownerIds.indexOf(v.owner) == -1) {
			ownerIds.push(v.owner);
		}
	});
	
	// Get users from DB
	var ownerNames = {};
	this.config.MongoDB.MongoClient.connect(this.config.cfg.mongo.uri + '/' + this.config.cfg.mongo.db + (this.config.cfg.mongo.options || ''), function(err, db) {
		if (err) return callback(null);
		var cursor = db.collection('users').find({id: {$in: ownerIds}}, {_id: 0, id: 1, screen_name: 1, logged_in: 1});
		cursor.each(function(err, user) {
			// Fill hashmap with user names
			if (!err && user) {
				ownerNames[user.id] = user.logged_in || user.screen_name;
			}
			if (user == null) {
				// Fill timers with user names
				timerList.forEach(function(t) {
					t.owner_name = ownerNames[t.owner];
				});
				callback(null, timerList);
				db.close();
			}
		});
	});
}

User.prototype.checkUpdateTwitterFriendsAndFollowers = function(user, callback) {
	var oldEnoughInSeconds = 3600; // 3600 is the default
	if (user && user.id && user.ot && user.ots) {
		console.log('checking need for updating friends and followers of ' + user.id);
		if (!user.relationships_timestamp || (Math.round(new Date().getTime() / 1000) - user.relationships_timestamp > oldEnoughInSeconds)) {
			this.updateTwitterFriendsAndFollowers(user.id, user.ot, user.ots, callback);
		} else {
			callback(null, user);
		}
	};
}

User.prototype.updateTwitterFriendsAndFollowers = function(id, accessToken, accessTokenSecret, callback) {
	var _user = this;
	var _MongoDB = this.config.MongoDB;
	var _cfg = this.config.cfg;
	var relationships = [];
	console.log('updating friends and followers of ' + id);
	
	var worker = function(task, callback) {
		//console.log('running task ' + JSON.stringify(task));
		//console.log('task[\'x-rate-limit-remaining\'] for ' + task.action + ' is ' + task['x-rate-limit-remaining']);
		var wainUntil = task['x-rate-limit-remaining'] === '0' ? parseInt(task['x-rate-limit-reset']) : false;
		
		_user.waitUntilTimestamp(wainUntil, function() {
			_user.getTwitterFriendsFollowersListPage(id, task.action, accessToken, accessTokenSecret, task['next_cursor_str'], function(err, obj) {
				if (!err && obj && obj.users && obj.users.length) {
					obj.users.forEach(function(user) {
						var found = false;
						
						relationships.forEach(function(e) {
							if (e.id == user.id) {
								found = true;
								if (task.action == 'friends') {
									//console.log('relationships entry for ' + user.id + ' found, adding friend');
									e.following = true;
								}
								if (task.action == 'followers') {
									//console.log('relationships entry for ' + user.id + ' found, adding follower');
									e.followed_by = true;
								}
							}
						});
						
						if (!found) {
							//console.log('relationships entry for ' + user.id + ' not found, adding ' + (task.action == 'friends' ? 'friend' : '') + (task.action == 'followers' ? 'follower' : ''));
							relationships.push({
								id: user.id,
								screen_name: user.screen_name,
								following: task.action == 'friends',
								followed_by: task.action == 'followers',
								friends_count: user.friends_count,
								followers_count: user.followers_count,
								profile_image_url_https: user.profile_image_url_https,
								
							});
						}
					});
				} else {
					console.log(JSON.stringify(err));
				}
				
				if (obj && obj['next_cursor_str'] != '0') {
					delete obj.users;
					queue.push(obj);
				}
				
				callback();
			});
		});
	};
	
	var queue = _user.config.async.queue(worker);
	
	queue.drain = function() {
		//console.log('result set has ' + relationships.length);
		
		_MongoDB.MongoClient.connect(_cfg.mongo.uri + '/' + _cfg.mongo.db + (_cfg.mongo.options || ''), function(err, db) {
			if (err) return callback(err, null);
			
			db.collection('users').findAndModify({id: id}, {}, {$set: {relationships: relationships, relationships_timestamp: Math.round(new Date().getTime() / 1000)}}, {safe: true, new: true}, function(err, user) {
				if (err) return callback(err, null);
				callback(err, user);
				db.close();
			});
		});
	};
	
	// Add tasks to queue
	queue.push([{
		action: 'friends',
		'next_cursor_str': -1
	}, {
		action: 'followers',
		'next_cursor_str': -1
	}]);
}

User.prototype.waitUntilTimestamp = function(timestamp, callback) {
	var delaySeconds = timestamp ? timestamp - Math.ceil(new Date().getTime() / 1000) : timestamp;
	if (timestamp && delaySeconds > 0) {
		//console.log('timeout for ' + delaySeconds + 's...');
		setTimeout(callback, delaySeconds * 1000);
	} else {
		console.log('no timeout needed');
		callback();
	}
}

User.prototype.getTwitterFriendsFollowersListPage = function(id, action, accessToken, accessTokenSecret, cursor, callback) {
	var _this = this;
	action = action == 'friends' ? 'friends' : 'followers';
	cursor = cursor || -1;
	console.log('asking twitter for the ' + action + ' of ' + id + ' with cursor ' + cursor);
	this.config.twitter[action]('list', {cursor: cursor}, accessToken, accessTokenSecret, function(err, data, response) {
		if (err) {
			callback(err, null);
		} else {
			callback(err, {
				action: action,
				users: data['users'],
				'next_cursor_str': data['next_cursor_str'],
				'x-rate-limit-remaining': response.headers['x-rate-limit-remaining'],
				'x-rate-limit-reset': response.headers['x-rate-limit-reset']
			});
		}
	});
}

module.exports = exports = User;