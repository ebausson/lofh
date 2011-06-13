/* node modules */
var connect = require("connect");				// connect middleware
var fs = require("fs");							// filesystem API
var url = require("url");						// URL parsing API


/* application modules */
var User = require('./User.js');
var Handler = require('./handler.js');


var DEBUG = true;

var server = connect.createServer(
	connect.logger("*** :status   :date - :url"),
	connect.favicon(__dirname + '/static/favicon.ico'),
    connect.cookieParser(),
    connect.session({secret:'some secret String'})
);



// ****************************
// **  dispatching requests  **
// ****************************

// static file serving
server.use("/static", connect.static(__dirname + '/static'));


// authentication request handling
server.use("/auth", function(req, res) {
	var parameters = getParameters(req.url);
	var success = false;
	if (parameters.user && parameters.password) {
		// loggin attempt
		success = User.authenticate(req.session, { user: parameters.user, pass: parameters.password });
		//TODO
	}
	if (! success) {
		console.log("********************");
		console.log("**  loggin error  **");
		console.log("********************");
		console.log(parameters);
		res.writeHead(401, {"Content-Type": "text/plain"});
		res.end("Bad Credentials\n");
		return;
	}
	
	// now operations in case of success
	req.session.userlogin = parameters.user;
	return success;
});

// other requests
server.use("/request", function(req, res) {
	var parameters = getParameters(req.url);
	if (User.isAuth(req, res)) {
		// if user is authentified
		response = Handler.handle(req, res, parameters);
		res.end(JSON.stringify(response));
	} else {
		//TODO fallback if user isn't logged in
		res.end("TODO : authentication");
	}
});


// "root" handling
server.use("/", function (req, res) {
	getIndex(req, res);
});

server.listen(3000);






// *************
// **  Utils  **
// *************

function getIndex(req, res) {
	var filename = __dirname + "/index.html";
	
	fs.readFile(filename, function(err, file) {
		if(err) {
			console.log(err);
			res.writeHead(500, {"Content-Type": "text/plain"});
			res.end(err + "\n");
			return;
		} else {
			res.writeHead(200, {"Content-Type" : "text/html"});
			res.end(file);
		}
	});
};

function getParameters(url) {
	var response = {};
	var query = url.split('?')[1];
	if (query) {
		queryEntries = query.split('&');
		for (var i = 0; i < queryEntries.length; i++) {
			var splittedQueryEntry = queryEntries[i].split('=');
			if (splittedQueryEntry[1]) {
				response[splittedQueryEntry[0]] = splittedQueryEntry[1];
			}
		}
	}
	return response;
}
