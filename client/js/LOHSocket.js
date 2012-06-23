LOH.WSocket=function(dispatch)
{
	//--------------------------------
	var socket = io.connect().of('/game');
	socket.on('SelectScreen', function (data) {
	
		socket.on('ready', function (data) {

			//----------------------
			dispatch['event']=function(data){
					data.timestamp=new Date().getTime();
					console.log('SPAM',data)
					socket.emit('event', data);
			};
			//----------------------
			socket.on('sync', function (data) {
				dispatch['sync'](data);
			});
			//----------------------
			dispatch['GameScreen'](data);			
		});
		dispatch['play']=function(data){socket.emit('play', data);delete dispatch['play'];};
		//--------------------------------
		dispatch['selectScreen'](data);
	});	
}