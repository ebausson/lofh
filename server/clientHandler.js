var connections = {};
var ObjectId = require('bson').ObjectID;
var DB=require('./DBacces.js');
var ressources=require('./ressource/ressourceHandler.js');
var game;
var ClientHandler=module.exports=function(gFrame){
//console.log(gFrame);
	this.newClient=function(socket){
	console.log('NEWClient:')
	DB.collection('accounts').findOne({_id:ObjectId(socket.handshake._id)},function(err,account){
		connection=connections[account._id]={
			'_id':account._id
			,'socket':socket
			,'slots':account.slots
		}

		socket.on('ressourceQuery', function (data) {
			//console.log('ressourceQuery:',data)
			ressources.getRessource(data.msg,function(result){
				//console.log('ressourceSync:',result)
				socket.emit('ressourceSync',result);
			});
		});
		
		socket.on('ClientEvent', function (data) {
			//console.log('ClientEvent:',data)
			//try{
				clientEvents[data.msg.id](connection,data.msg);
			//}catch(err){console.log('ClientEvent:',err)}
		});
		socket.on('disconnect', function () {
				delete connections[account._id];
		});
		// New message from client = "write" event
		socket.on('write', function (message) {
			console.log(message)
			//sockets.emit('message', account.username, message, Date.now());
		});
		//-------------------------------
		socket.emit('waiting');
	});
}
this.close=function(id){
	connections[id].disconnect();
	delete connections[id];
}
var clientEvents={}
clientEvents['SelectReady']=function(connection,data){
console.log('SelectReady')
connection.socket.emit('Gamesync',{'preload':gFrame.getPreloadSlotID(connection.slots),'more':{'ligths':{'b':'light1','c':'light2'}}});
	connection.socket.emit('Clientsync',{'func':'setCharacters','params':{'data':connection.slots}});
	
}
DummyEntity={
	id:1
	,position:new THREE.Vector3()
	,rotation:new THREE.Vector3()
	,scale:new THREE.Vector3(1,1,1)
	,name:'NAME'
	,pattern:'Player'
	,type:'Character'
};
clientEvents['CreateCharacter']=function(connection,data){
console.log('CreateCharacter')
	gFrame.createEntity(DummyEntity,function(ent){
		connection.entity=ent;
		connection.slots[data.which]=connection.entity._id;
		DB.collection('accounts').update({'_id':connection._id},{$set:{'slots':connection.slots}});
	});
}
clientEvents['play']=function(connection,data){
console.log('play')
	connection.entity=gFrame.getEntity(connection.slots[data.which]);
}
clientEvents['GameReady']=function(connection){
	console.log(Object.keys(connection.entity).length)
	connection.socket.emit('Gamesync',{'objects':gFrame.getMETAObject(connection.entity.view),"more":{"avatar":connection.entity._id,'ligths':{'b':'light1','c':'light2'}}});
	connection.socket.on('GameEvent', function (data) {
		try{
			connection.entity.zone.WorldRules[data.msg['func']](connection.entity,data.msg['data'],data.msg['timestamp']);
		}catch(err){console.log('GameEvent:',err)}
	});
	connection.ready=true;
}

var update=function(){
	for(conn in connections){
		if(connections[conn].ready){
			connections[conn].socket.emit('Gamesync',{'objects':gFrame.getMETAObject(connections[conn].entity.view),'timestamp':new Date().getTime()});
		}
	}
}
setInterval(update,100);
return this;
}

