LOH.WSocket=function(world)
{
	//--------------------------------
	var socket = io.connect('http://localhost');
	socket.on('news', function (data) {
		console.log(data);
		world.setTarget(data);
		socket.emit('my other event', { my: 'data' });
	});
	socket.on('sync', function (data) {
		world.sync(data);
	});
	this.update=function()
	{
		if(world.getEntity("target"))
		{
			socket.emit('movement', world.getEntity("target").position);
		}
		
	}
	//--------------------------------

}