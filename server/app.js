/* node modules */
//var connect = require("connect");				// connect middleware
var fs = require("fs");							// filesystem API
var url = require("url");						// URL parsing API
var io = require('socket.io');
var express = require('express'),
app = express.createServer();

/* game modules */
var game = require('./gameEngine.js');
var DB = require('./DBacces.js');


/* application modules */
var User = require('./User.js');
var Handler = require('./handler.js');


var DEBUG = true;

// var server = connect.createServer(
	// connect.logger("*** :status   :date - :url"),
	// connect.favicon(__dirname + '/../client/favicon.ico'),
    // connect.cookieParser(),
    // connect.session({secret:'some secret String'})
// );


	app.use(express.logger());
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: "keyboard cat" }));
	app.use(app.router);
	app.use(express.static('public'));
	app.use(express.errorHandler());


// ****************************
// **  dispatching requests  **
// ****************************

// static file serving
app.use("/static", express.static(__dirname + '/../client'));



// authentication request handling
app.use("/auth", function(req, res) {
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
app.use("/request", function(req, res) {
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
app.use("/", function (req, res) {
	getIndex(req, res);
});

app.listen(3000);






// *************
// **  Utils  **
// *************

function getIndex(req, res) {
	var filename = __dirname + "/../client/index.html";
	
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
//***************//
//   SOCKET.IO   //
//***************//
console.log(game.entities);
DB.launchDB(game);
console.log(game.entities);
// Socket io ecoute maintenant notre application !
io = io.listen(app); 
io.set('log level', 1);
// Quand une personne se connecte au serveur
io.sockets.on('connection', function (socket) {
	var clients=new game.Entity();
	console.log(clients);
	socket.emit('news', clients.id);
	socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('movement', function (data) {
    clients.position=data;
  });
});
setTimeout(updateDB , 10000 );
var updateDB=function(){
	DB.updateDB(game);
	setTimeout( updateDB, 10 );
	
};
var update=function(){
	
	io.sockets.emit('sync', game.entities);
	setTimeout( update, 10 );
	
};
update();