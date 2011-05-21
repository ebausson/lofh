/*
**
**
**
*/
var scene, renderer;
var CANVAS= CANVAS ||function() {

	initCam();
	initScene();
	initLight();
	
	renderer = new THREE.CanvasRenderer();
	renderer.setSize(window.innerWidth , window.innerHeight);
	fillScene();
	return renderer.domElement;
}

 function initCam(){
	camera = new THREE.Camera( 60, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.y=100;
}

function initLight() {
	var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
	scene.addLight( ambientLight );
}

function moveCam(){

var timer = new Date().getTime() * 0.0001;

	camera.position.x = Math.cos( timer ) * 200;
	camera.position.z = Math.sin( timer ) * 200;

}
function refreshCanvas(){
	
	animate();
	render();

}

function animate() {

	render();

}

function render() {
	
	var timer = new Date().getTime() * 0.0001;

	//camera.position.x = Math.cos( timer ) * 200;
	camera.position.z = Math.sin( timer ) * 200;
	

	renderer.render( scene, camera );

}