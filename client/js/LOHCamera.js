
var CAMERA=CAMERA||{};



function getCamera(){
	CAMERA = new THREE.Camera( 60, window.innerWidth / window.innerHeight, 1, 10000);

	getCamera=function(){
		return CAMERA;	
	}
	return CAMERA;
}