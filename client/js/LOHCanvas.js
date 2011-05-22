/*
**
**
**
*/

var CANVAS=CANVAS||{};


function getCanvas() {

	initScene();
	initLight();
	
	CANVAS.renderer = new THREE.CanvasRenderer();
	CANVAS.renderer.setSize(window.innerWidth , window.innerHeight);
	fillScene();
	
	getCanvas=function()
	{
		return CANVAS;
	}
	getCanvas().renderer.domElement.onmousedown=function()
	{
		getCanvas().renderer.domElement.onmousemove=moveCam;
	}
	getCanvas().renderer.domElement.onmouseup=function()
	{
		getCanvas().renderer.domElement.onmousemove={};
	}
	return CANVAS;
}



function initLight() {
	var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
	scene.addLight( ambientLight );
}

function moveCam(){

	getCamera().position.x = getCamera().position.x+1;

}

CANVAS.refreshCanvas=function(){
	
	CANVAS.animate();
	CANVAS.render();

}

CANVAS.animate=function(){

	CANVAS.render();

}

CANVAS.render=function(){
	
	var timer = new Date().getTime() * 0.0001;

	//camera.position.x = Math.cos( timer ) * 200;
	getCamera().position.z = Math.sin( timer ) * 200;
	

	getCanvas().renderer.render( scene, getCamera() );

}