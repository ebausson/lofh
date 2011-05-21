var GAME= GAME || function (){
var gameContainer=document.createElement('div');
document.body.appendChild( gameContainer );
gameContainer.appendChild(CANVAS);
gameContainer.appendChild(GUI);
return gameContainer;
}

GAME.refreshGame=function(){
	requestAnimationFrame( GAME.refreshGame );
	refreshCanvas();
	refreshGUI();
}