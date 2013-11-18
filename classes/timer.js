var Timer = function (opts) {
	opts = (opts === Object(opts)) ? opts : {};
	
	// If opts are empty, give timer defaultValues else fill it
	if (Object.keys(opts).length === 0) {
		for (var key in opts) if ({}.hasOwnProperty.call(Timer.defaultValues, key)) {
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

Timer.prototype.values = function() {
	if (this.set == 1) {
		setObject = {};
		setObject['set'] = 1;
		
		for(var i in Timer.defaultValues) {
			if (this.hasOwnProperty(i)) {
				setObject[i] = this[i];
			}
		};
		setObject['owner_name'] = this.getOwnerName();
		return setObject;
	} else {
		return {
			set: this.set,
			id: this.id
		};
	}
}

Timer.prototype.showJson = function() {
	return this.values();
}

Timer.prototype.showJsonCanEdit = function() {
	result = this.values();
	result['can_edit'] = 1;
	return result;
}

Timer.prototype.showJsonDenied = function() {
	return {
		id: this.id,
		set: this.set,
		denied: 1
	};
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

Timer.prototype.getOwnerName = function() {
	return 'getOwnerName NYI';
}

module.exports = exports = Timer;