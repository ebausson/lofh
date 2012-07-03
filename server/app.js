const path = require('path')
    , express = require('express')
    , app = module.exports = express.createServer()
    , port = process.env.PORT || 3000
 /* game modules */
	
	, DB = require('./DBacces.js')
	, gFrame = require('./gamelib/gameFrame.js')(ready);
	;

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
	, cookie: {path: '/', httpOnly: true, maxAge:10*1000}
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
  if (req.session._id) {
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
				account={'name':req.body.username,'slots':{'slot1':0,'slot2':0,'slot3':0}};
				DB.collection('accounts').insert(account);
				console.log('new account',account)
			}else{
				for (var i=0; i<sessions.length; i++) {
				  var session = JSON.parse(sessions[i]);
				  if (session.username == req.body.username) {
						app.sessionStore.destroy(session, function(){
							clientHandler.close(account._id)
						});
					break;
				  }
				}
			}
			req.session._id=account._id;
			res.redirect("/");
		})
      }else {
        options.error = ""+err;
        res.render("login", options);
      }
    });
  }
});
function ready(){
console.log('ready')
/** WebSocket */
var io=require('socket.io').listen(app);
var clientHandler=require('./clientHandler.js')(gFrame);
io.set('log level', 1);
var sockets = io.of('/game');
sockets.authorization(function (handshakeData, callback) {
	if(!handshakeData.headers.cookie){
		callback( '=====>User not authenticated', false);
		return;
	}
  // Read cookies from handshake headers
  var cookies = require('cookie').parse(handshakeData.headers.cookie.replace(/%2B/g,'+'));
  // We're now able to retrieve session ID
  var sessionID = cookies['connect.sid'];//replace for some crazy reason
  // No session? Refuse connection
  if (!sessionID) {
    callback('No session', false);
  } else {
    // On récupère la session utilisateur, et on en extrait son _id
    app.sessionStore.get(sessionID, function (err, session) {
      if (!err && session && session._id) {
        // On stocke ce _id dans les données de l'authentification, pour réutilisation directe plus tard
			 handshakeData._id =session._id;
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
	// this is required if we want to access this data when user leaves, as handshake is
	// not available in "disconnect" event.
	clientHandler.newClient(socket)
});
}
setInterval(storeCleanUp,10*1000);


/** Start server */
if (!module.parent) {
  app.listen(port)
}
