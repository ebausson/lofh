const path = require('path')
    , express = require('express')
    , app = module.exports = express.createServer()
    , port = process.env.PORT || 3000
    ;
	
 /* game modules */
var game = require('./gameEngine.js');
var DB = require('./DBacces.js');
/** Configuration */
app.configure(function() {
  this.set('views', path.join(__dirname, 'views'));
  this.set('view engine', 'ejs');
  this.use(express.static(path.join(__dirname, '/public')));
  this.use("/static", express.static(__dirname + '/../client'));
  // Allow parsing cookies from request headers
  this.use(express.cookieParser());
  // Session management
  // Internal session data storage engine, this is the default engine embedded with connect.
  // Much more can be found as external modules (Redis, Mongo, Mysql, file...). look at "npm search connect session store"  
  this.sessionStore = new  express.session.MemoryStore({ reapInterval: 10*1000 })
  this.use(express.session({ 
    store: this.sessionStore
	, cookie: {path: '/', httpOnly: true, maxAge:10 * 1000}
	, secret: 'topsecret'   
  }));
  // Allow parsing form data
  this.use(express.bodyParser());
});
app.configure('development', function(){
  this.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
  this.use(express.errorHandler());
});
 
/** Routes */
/** Middleware for limited access */
function requireLogin (req, res, next) {
  if (req.session.username) {
    // User is authenticated, let him in
    next();
  } else {
    // Otherwise, we redirect him to login form
    res.redirect("/login");
  }
}

function storeCleanUp () {
	app.sessionStore.all(function (err, sessions) {
		if (!err) {
			for (var i=0; i<sessions.length; i++) {
				app.sessionStore.get(sessions[i], function() {} );
			}
		}
	});
}
/** Home page (requires authentication) */
app.get('/', [requireLogin], function (req, res, next) {
  res.render('index', { "username": req.session.username });
});

/** Login form */
app.get("/login", function (req, res) {
  // Show form, default value = current username
  res.render("login", { "username": req.session.username, "error": null });
});

app.post("/login", function (req, res) {
  var options = { "username": req.body.username, "error": null };
  if (!req.body.username) {
    options.error = "User name is required";
    res.render("login", options);
  } else if (req.body.username == req.session.username) {
    res.redirect("/");
  } else if (!req.body.username.match(/^[a-zA-Z0-9\-_]{3,}$/)) {
    options.error = "User name must have at least 3 alphanumeric characters";
    res.render("login", options);
  } else {
    // Validate if username is free
	 req.sessionStore.all(function (err, sessions) {
      if (!err) {
        
		DB.collection('accounts').findOne({name:req.body.username},function(err,account){
			if(!account){
				DB.collection('accounts').insert({name:req.body.username})
			}else{
				for (var i=0; i<sessions.length; i++) {
				  var session = JSON.parse(sessions[i]);
				  if (session.username == req.body.username) {
						app.sessionStore.destroy(session, function(){
							connections[account._id].disconnect();
							delete connections[account._id];
						});
						
					break;
				  }
				}
			}
			req.session.username = req.body.username;
			res.redirect("/");
		})
      }else {
        options.error = ""+err;
        res.render("login", options);
      }
    });
  }
});

/** WebSocket */
var connections = {};
var io=require('socket.io').listen(app);
io.set('log level', 1);
var sockets = io.of('/game');
sockets.authorization(function (handshakeData, callback) {
	if(!handshakeData.headers.cookie){
		callback( '=====>User not authenticated', false);
		return;
	}
  // Read cookies from handshake headers
  var cookies = require('cookie').parse(handshakeData.headers.cookie.replace('%2B','+'));
  // We're now able to retrieve session ID
  var sessionID = cookies['connect.sid'];//replace for some crazy reason
  // No session? Refuse connection
  if (!sessionID) {
    callback('No session', false);
  } else {
    // Store session ID in handshake data, we'll use it later to associate
    // session with open sockets
    handshakeData.sessionID = sessionID;
    // On récupère la session utilisateur, et on en extrait son username
    app.sessionStore.get(sessionID, function (err, session) {
      if (!err && session && session.username) {
        // On stocke ce username dans les données de l'authentification, pour réutilisation directe plus tard
        handshakeData.username = session.username;
        // OK, on accepte la connexion
        callback(null, true);
      } else {
        // Session incomplète, ou non trouvée
        callback(err || 'User not authenticated', false);
      }
    });
  }
});
// Active sockets by session
sockets.on('connection', function (socket) { // New client
	var sessionID = socket.handshake.sessionID; // Store session ID from handshake
	var client;
	// this is required if we want to access this data when user leaves, as handshake is
	// not available in "disconnect" event.
	var username = socket.handshake.username; // Same here, to allow event "bye" with username
	DB.collection('accounts').findOne({name:username},function(err,account){
		connections[account._id] = socket;
		entityID=account.entityID
		DB.collection('entities').findOne({_id:entityID},function(err,entity){
			if(!entity){
				entity=new game.Entity(username);
				DB.collection('entities').insert(entity);
				DB.collection('entities').findOne({name:username},function(err,entity){
					DB.collection('account').update({_id:account._id},{$set:{entityID:entity._id}},function(err,entity){});
				});
			}
			client.charID=entity._id;
				socket.emit('news', entity.name);
			
		});
		
		socket.on('my other event', function (data) {
			console.log('my other event:',data);
		});
		socket.on('disconnect', function () {
				delete connections[sessionID];
		});
		// New message from client = "write" event
		socket.on('write', function (message) {
			sockets.emit('message', username, message, Date.now());
		});
		//-------------------------------
		socket.on('movement', function (data) {
			DB.collection('entities').update({_id:client.charID},{$set:{position:data}});
		});
	});
	
	
	
});
var update=function(){
	DB.collection('entities').find({},function(err,data){
		if(data)
			sockets.emit('sync',data);
	});	
};
setInterval(update,10);
setInterval(storeCleanUp,10*1000);

/** Start server */
if (!module.parent) {
  app.listen(port)
}
