/*
**
**
**
*/

var camera, scene, renderer;

function initCam() {
	camera = new THREE.Camera( 60, window.innerWidth / window.innerHeight, 1, 10000);
}

function initScene() {
	scene = new THREE.Scene();
}

function initLight() {
	var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
	scene.addLight( ambientLight );
}

function initCanvas(game) {

	initCam();
	initScene();
	initLight();
	
	renderer = new THREE.CanvasRenderer();
	renderer.setSize(window.innerWidth , window.innerHeight);
	game.appendChild( renderer.domElement );
}

function refreshCanvas(){




}