LOH.WSocket=function(callback)
{
	//--------------------------------
	var socket = io.connect().of('/game');
	socket.on('sync', function (data) {if(dispatch['sync'])dispatch['sync'](data);});
	socket.on('ressourceSync',  function (data) {if(dispatch['ressourceSync'])dispatch['ressourceSync'](data);});
	//----------------------
	dispatch['ClientEvent']=function(data){
	// console.log('ClientEvent:',data)
		socket.emit('ClientEvent', {msg:data,timestamp:new Date().getTime()});
	};
	//----------------------
	dispatch['ressourceQuery']=function(data){
	// console.log('ressourceQuery')
		socket.emit('ressourceQuery', {msg:data,timestamp:new Date().getTime()});
	};
	//----------------------
	dispatch['GameEvent']=function(data){
	// console.log('GameEvent')
		socket.emit('GameEvent', {msg:data,timestamp:new Date().getTime()});
	};
	//----------------------
	socket.on('disconnect', function (data) {alert('Connection lost '+data)});
	
	socket.on('waiting',function(){socket.emit('toto');callback()});
}