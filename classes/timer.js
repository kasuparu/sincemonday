var Timer = function (opts) {
	opts = (opts === Object(opts)) ? opts : {};
	
	if (Object.keys(opts).length === 0) {
		for (var key in Timer.defaultValues) if ({}.hasOwnProperty.call(Timer.defaultValues, key)) {
			this[key] = Timer.defaultValues[key];
		}
		this['set'] = 0;
	} else {
		for (var key in opts) if ({}.hasOwnProperty.call(opts, key)) {
			this[key] = opts[key];
		}
		this['set'] = 1;
	}
};

Timer.defaultValues = {
	id: -1,
	owner: 0,
	name: '',
	last_restart: 0,
	'public': 0,
	good: 1,
	removed: 0,
	created: 0,
	date_selected: 0,
	random: 0
};

Timer.config = {};

Timer.configure = function (opts) {
	opts = (opts === Object(opts)) ? opts : {};
	
	for (var key in opts) if ({}.hasOwnProperty.call(opts, key)) {
		Timer.config[key] = opts[key];
	}
	
};

Timer.findById = function(id, callback) {
	Timer.config.MongoDB.MongoClient.connect(Timer.config.cfg.mongo.uri + '/' + Timer.config.cfg.mongo.db + (Timer.config.cfg.mongo.options || ''), function(err, db) {
		if (err) return callback(err, null);
		
		db.collection('timers').findOne({id: id}, function(err, obj) {
			if (err) return callback(err, obj);
			callback(err, new Timer(obj));
			db.close();
		});
    });
};

Timer.prototype.getOwner = function(callback) {
	Timer.config.User.findById(this.owner, function(user) {
		callback(user);
	});
};

Timer.prototype.values = function(callback) {
	if (this.set == 1) {
		var setObject = {};
		setObject['set'] = 1;
		
		for(var i in Timer.defaultValues) {
			if ({}.hasOwnProperty.call(this, i)) {
				setObject[i] = this[i];
			}
		};
		this.getOwner(function(user) {
			if (user) setObject['owner_name'] = user.logged_in;
			callback(null, setObject);
		});
		
	} else {
		callback(null, {
			set: this.set,
			id: this.id
		});
	}
}

Timer.prototype.showJson = function(callback) {
	this.values(callback);
}

Timer.prototype.showJsonCanEdit = function(callback) {
	this.values(function(err, setObject) {
		if (err) return callback(err, setObject);
		setObject['can_edit'] = 1;
		callback(null, setObject);
	});
	
}

Timer.prototype.showJsonDenied = function(callback) {
	callback(null, {
		id: this.id,
		set: this.set,
		denied: 1
	});
}

Timer.prototype.viewAllowed = function(userId) {
	return ((userId === this.owner) || (this['public']));
}

Timer.prototype.restartAllowed = function(userId) {
	return ((userId === this.owner) || (this.id === 0));
}

Timer.prototype.editAllowed = function(userId) {
	return ((userId === this.owner) || ((typeof userId !== 'undefined') && (this.id === -1)));
}

Timer.prototype.restart = function(callback) {
	var nowTimestamp = Math.round(new Date().getTime() / 1000);
	this.last_restart = nowTimestamp;
	target = this;
	
	Timer.config.MongoDB.MongoClient.connect(Timer.config.cfg.mongo.uri + '/' + Timer.config.cfg.mongo.db + (Timer.config.cfg.mongo.options || ''), function(err, db) {
		db.collection('timers').findAndModify({id: target.id}, {}, {$set: {last_restart: nowTimestamp}}, {safe: true, new: true}, function(err, timer) {
			if (err) return callback(err, null);
			if (timer) {
				Timer.recordUpdate(new Timer(timer), callback);
				db.close();
			}
			else {
				callback(err, null);
				db.close();
			}
		});
	});
}

Timer.recordUpdate = function(timer, callback) {
	Timer.config.MongoDB.MongoClient.connect(Timer.config.cfg.mongo.uri + '/' + Timer.config.cfg.mongo.db + (Timer.config.cfg.mongo.options || ''), function(err, db) {
		if (err) return callback(err, null);
		db.collection('updates').insert({id: timer.id, last_restart: timer.last_restart}, {safe: true}, function(err, obj) {
			if (err) return callback(err, null);
			
			callback(err, timer);
			db.close();
		});
	});
}

Timer.getRandomId = function(callback) {
	var random = Math.random();
	
	Timer.config.MongoDB.MongoClient.connect(Timer.config.cfg.mongo.uri + '/' + Timer.config.cfg.mongo.db + (Timer.config.cfg.mongo.options || ''), function(err, db) {
		if (err) return callback(err, null);
		
		db.collection('timers').findOne({public: 1, removed: 0, random: {$gte: random}}, {id: 1, _id: 0}, function(err, obj) {
			if (err) return callback(err, obj);
			
			if (obj) {
				callback(err, obj);
				db.close();
			} else {
				
				db.collection('timers').findOne({public: 1, removed: 0, random: {$lte: random}}, {id: 1, _id: 0}, function(err, obj) {
					if (err) return callback(err, obj);
					callback(err, obj);
					db.close();
				});
				
			}
		});
    });
}

Timer.getHandle = function(handleName, callback) {
	Timer.findHandle(handleName, function(err, handle) {
		if (err) return callback(err, handle);
		var nowTimestamp = Math.round(new Date().getTime() / 1000);
		if (handle && (nowTimestamp - handle.timestamp < 20)) {
			callback(err, handle);
		} else {
			Timer.regenerateHandle(handleName, function(err, handle) {
				if (err) return callback(err, null);
				callback(err, handle);
			});
		}
	});
}

Timer.findHandle = function(handleName, callback) {
	Timer.config.MongoDB.MongoClient.connect(Timer.config.cfg.mongo.uri + '/' + Timer.config.cfg.mongo.db + (Timer.config.cfg.mongo.options || ''), function(err, db) {
		if (err) return callback(err, null);
		
		db.collection('handles').findOne({handle: handleName}, function(err, obj) {
			if (err) return callback(err, obj);
			callback(err, obj);
			db.close();
		});
    });
}

Timer.regenerateHandle = function(handleName, callback) {
	if (handleName == 'about_3random') {
		var ids = [];
		var tries = 0;
		var queue = Timer.config.async.queue(function(object, callback) {
			Timer.getRandomId(function(err, obj) {
				tries++;
				if ((err || !obj || !obj.id || ids.indexOf(obj.id) != -1) && tries < 10) {
					queue.push({});
					callback();
				} else {
					if (obj.id) {
						ids.push(obj.id);
					}
					callback();
				}
			});
		});
		queue.drain = function() {
			var nowTimestamp = Math.round(new Date().getTime() / 1000);
			Timer.saveHandle(handleName, {timestamp: nowTimestamp, ids: ids}, callback);
		};
		
		queue.push({});
		queue.push({});
		queue.push({});
	} else {
		Timer.findHandle(handleName, function(err, handle) {
			if (err) return callback(err, handle);
			callback(err, handle);
		});
	}
}

Timer.saveHandle = function(handleName, setObject, callback) {
	Timer.config.MongoDB.MongoClient.connect(Timer.config.cfg.mongo.uri + '/' + Timer.config.cfg.mongo.db + (Timer.config.cfg.mongo.options || ''), function(err, db) {
		db.collection('handles').findAndModify({handle: handleName}, {}, {$set: setObject}, {safe: true, new: true, upsert: true}, function(err, handle) {
			if (err) return callback(err, null);
			callback(err, handle);
			db.close();
		});
	});
}

Timer.getMaxId = function(callback) {
	Timer.config.MongoDB.MongoClient.connect(Timer.config.cfg.mongo.uri + '/' + Timer.config.cfg.mongo.db + (Timer.config.cfg.mongo.options || ''), function(err, db) {
		db.collection('timers').aggregate([
			{$group: {
				_id: 'maxId',
				maxId: {$max: '$id'}
			}}
		], function(err, result) {
			if (err) return callback(err, null);
			callback(err, result[0]['maxId'] || 1);
			db.close();
		});
	});
}

Timer.prototype.setProps = function(label, ownerId, lastRestart, dateSelected) {
	if (typeof lastRestart != 'undefined' && lastRestart != -1 && lastRestart != '-1' && !isNaN(parseInt(lastRestart))) {
		this.last_restart = parseInt(lastRestart);
	}
	this.name = label.substring(0, 120);
	this.date_selected = dateSelected ? 1 : 0;
	this.owner = parseInt(ownerId);
	this.random = Math.random();
	this.set = 1;
}

Timer.prototype.setPublic = function(publicVal) {
	if (this.set == 1) {
		this.public = publicVal != '1' ? 0 : 1;
	}
}

Timer.prototype.setGood = function(goodVal) {
	if (this.set == 1) {
		this.good = goodVal == '1' ? 1 : 0;
	}
}

Timer.prototype.save = function(callback) {
	if (this.set == 1) {
		var setObject = {};
		for(var i in Timer.defaultValues) {
			if ({}.hasOwnProperty.call(this, i)) {
				setObject[i] = this[i];
			} else {
				setObject[i] = this[i] = Timer.defaultValues[i];
			}
		};
		if (this.id == -1) {
			this.insert(setObject, callback);
		} else {
			this.update(setObject, callback);
		}
	}
}

Timer.prototype.insert = function(setObject, callback) {
	var timer = null;
	Timer.config.MongoDB.MongoClient.connect(Timer.config.cfg.mongo.uri + '/' + Timer.config.cfg.mongo.db + (Timer.config.cfg.mongo.options || ''), function(err, db) {
		db.ensureIndex('timers', {id:1}, {unique: true}, function(err, index) {
			var queue = Timer.config.async.queue(function(id, callback) {
				var insertObject = setObject;
				insertObject.id = id;
				insertObject.created = Math.round(new Date().getTime() / 1000);
					
				db.collection('timers').insert(insertObject, {safe: true}, function(err, records) {
					if (err) {
						if (err.code == 11000 /* dup key */) {
							queue.push(id+1);
							callback();
						}
					} else {
						timer = new Timer(records[0]);
						callback();
						db.close();
					}
				});
			});
			queue.drain = function() {
				Timer.recordUpdate(timer, function(err, timer){
					callback(err, timer);
				});
			};
			
			Timer.getMaxId(function(err, id) {
				if (err) return callback(err, null);
				queue.push(id+1);
			});
		});
	});
		
	
}

Timer.prototype.update = function(setObject, callback) {
	Timer.config.MongoDB.MongoClient.connect(Timer.config.cfg.mongo.uri + '/' + Timer.config.cfg.mongo.db + (Timer.config.cfg.mongo.options || ''), function(err, db) {
		db.collection('timers').findAndModify({id: setObject.id}, {}, {$set: setObject}, {safe: true, new: true}, function(err, timer) {
			if (err) return callback(err, null);
			callback(err, new Timer(timer));
			db.close();
		});
	});
}

Timer.prototype.remove = function(timer, callback) {
	timer.restart(function(err, timer) {
		if (err) return callback(err, null);
		Timer.config.MongoDB.MongoClient.connect(Timer.config.cfg.mongo.uri + '/' + Timer.config.cfg.mongo.db + (Timer.config.cfg.mongo.options || ''), function(err, db) {
			db.collection('timers').findAndModify({id: timer.id}, {}, {$set: {removed: 1}}, {safe: true, new: true}, function(err, timer) {
				if (err) return callback(err, null);
				callback(err, new Timer(timer));
				db.close();
			});
		});
	});
}

module.exports = exports = Timer;