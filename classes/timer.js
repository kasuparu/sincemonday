var defaultValues = {

};

var Timer = function (opts) {
	opts = (opts === Object(opts)) ? opts : {};
	
	// If id is specified, load timer data from DB, else give new object default values
	if (false/* */) {
		if ({}.hasOwnProperty.call(opts, 'id')) {
			// load
		}
	} else {
		for (var key in opts) if ({}.hasOwnProperty.call(opts, key)) {
			this[key] = opts[key];
		}
	}

    
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
			callback(err, obj);
			db.close();
		});
    });
};

module.exports = exports = Timer;