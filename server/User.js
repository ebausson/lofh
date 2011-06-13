var User = exports;

User.authenticate = function(request, parameters) {
	var username = parameters.user;
	var password = parameters.pass;
	console.log("*** Login attempt : ");
	console.log(parameters);
	//TODO : login
	if (username == password) {
		return true;
	}
	return false;
}

User.isAuth = function(req, res){
	console.log(req.session);
	return true;
}
