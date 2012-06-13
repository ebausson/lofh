LOH.Game=function(){
	var gameContainer=document.createElement('div');
	document.body.appendChild( gameContainer );
	var  stats;
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	gameContainer.appendChild( stats.domElement );
	var view=new LOH.Canvas(stats);
	gameContainer.appendChild(view.getCanvas());
	var refresh=function()
	{
		 view.refreshCanvas();
	}
	refresh();
}
