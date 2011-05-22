var GAME= GAME || {};

function getGame (){
var gameContainer=document.createElement('div');
document.body.appendChild( gameContainer );
gameContainer.appendChild(getCanvas().renderer.domElement);
//gameContainer.appendChild(GUI);
return gameContainer;
}

GAME.refreshGame=function(){

	window.setTimeout( GAME.refreshGame, 1 / 600 );
	//requestAnimationFrame( GAME.refreshGame );
	getCanvas().refreshCanvas();
	refreshGUI();
}