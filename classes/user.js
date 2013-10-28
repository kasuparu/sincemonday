function User(){
	
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
	
	callback(user);
}

module.exports = new User();