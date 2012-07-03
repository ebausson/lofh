LOH.WSocket=function(callback)
{
	//--------------------------------
	var socket = io.connect().of('/game');
	socket.on('Gamesync', function (data) {if(dispatch['Gamesync'])dispatch['Gamesync'](data);});
	socket.on('Clientsync', function (data) {if(dispatch['Clientsync'])dispatch['Clientsync'](data);});
	socket.on('ressourceSync',  function (data) {if(dispatch['ressourceSync'])dispatch['ressourceSync'](data);});
	//----------------------
	dispatch['ClientEvent']=function(data){
		socket.emit('ClientEvent', {msg:data,timestamp:new Date().getTime()});
	};
	//----------------------
	dispatch['ressourceQuery']=function(data){
		console.log('ressourceQuery:',data);
		socket.emit('ressourceQuery', {msg:data,timestamp:new Date().getTime()});
	};
	//----------------------
	dispatch['GameEvent']=function(data){
		socket.emit('GameEvent', {msg:data,timestamp:new Date().getTime()});
	};
	//----------------------
	socket.on('disconnect', function (data) {alert('Connection lost '+data)});
	socket.on('waiting', function (data) {callback();});
}