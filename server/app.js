const path = require('path')
    , express = require('express')
    , app = module.exports = express.createServer()
    , port = process.env.PORT || 3000
	, ObjectId = require('bson').ObjectID
 /* game modules */
	, game = require('./gameEngine.js')
	, DB = require('./DBacces.js')
	, DEFAULT = require('./default.js')
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
				account={name:req.body.username};
				DB.collection('accounts').insert(account);
				console.log('new account',account)
			}else{
				for (var i=0; i<sessions.length; i++) {
				  var session = JSON.parse(sessions[i]);
				  if (session.username == req.body.username) {
						app.sessionStore.destroy(session, function(){
							connections[account._id].socket.disconnect();
							delete connections[account._id];
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
	DB.collection('accounts').findOne({_id:ObjectId(socket.handshake._id)},function(err,account){
		if (!err && account){
			connection=connections[account._id]={};
			connection.socket= socket;
			if(!account.entityID){
				connection.entity=new game.Character(account.name);
				DB.collection('entities').insert(entity);
				account.entityID=entity._id;
				DB.collection('accounts').save(account,function(err,entity){});
				game.gameEntities[entity._id]=entity;
			}else{
				connection.entity=game.gameEntities[account.entityID];
			}
			//socket.on('toto',function(data){console.log('tictoc',data)});
			socket.on('ressourceQuery', function (data) {
				socket.emit('ressourceSync', {'id':data.msg,'ressource':DEFAULT.defaultRessource()});
			});
			socket.on('ClientEvent', function (data) {
				try{
					clientEvents[data.msg.id](connection,data.msg);
					//console.log(data.msg)
				}catch(err){console.log(err)}
			});
			socket.on('disconnect', function () {
					delete connections[account._id];
			});
			// New message from client = "write" event
			socket.on('write', function (message) {
				sockets.emit('message', account.username, message, Date.now());
			});
			//-------------------------------
			socket.emit('waiting');
		}else{
			console.log(err)
		}
	});
});
var loadDB=function(){
	DB.collection('entities').find({},function(err,data){
		for(i=0; i<data.length ; i++){
			game.gameEntities[data[i]._id]=game.CopyEntity(data[i]);
		}
	});
}
var update=function(){
	for(conn in connections){
		if(connections[conn].ready)
			connections[conn].socket.emit('sync',{'objects':game.gameEntities,'timestamp':new Date().getTime()});
	}

};
loadDB();
setInterval(update,1000);
setInterval(storeCleanUp,10*1000);

var clientEvents={}
clientEvents['SelectReady']=function(connection,data){
	id=connection.entity._id
	connection.socket.emit('sync',{"objects":{id:connection.entity},"more":{"avatar":id,'ligths':{'b':'light1','c':'light2'}}});
}
clientEvents['play']=function(connection,data){
	custom=DEFAULT.defaultRessource();
	custom.objects=game.viewSerializer(game.gameEntities);
	connection.socket.emit('sync',{"id":connection.entity._id});
}
clientEvents['GameReady']=function(connection){
	id=connection.entity._id
	connection.socket.emit('sync',{"objects":{id:connection.entity},"more":{"avatar":id,'ligths':{'b':'light1','c':'light2'}}});
	connection.socket.on('GameEvent', function (data) {
		try{
			game.gameRules[data.msg['func']](game.gameEntities[connection.entity._id],data.msg['data'],data.msg['timestamp']);
		}catch(err){console.log(err)}
	});
	connection.ready=true;
}
/** Start server */
if (!module.parent) {
  app.listen(port)
}
