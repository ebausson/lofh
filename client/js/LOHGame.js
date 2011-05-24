function Game (){
	var gameContainer=document.createElement('div');
	document.body.appendChild( gameContainer );
	var view=new Canvas();
	gameContainer.appendChild(view.getCanvas());
	var refresh=function()
	{
		 view.refreshCanvas();
	}
	refresh();
}
