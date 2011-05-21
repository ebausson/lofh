

function initScene(){

scene = new THREE.Scene();

}

function fillScene(){
	var geometry = new THREE.Cube( 50, 50, 50 );
	var material = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading } );

	for ( var i = 0; i < 10; i ++ ) {

		var cube = new THREE.Mesh( geometry, material );
		cube.overdraw = true;
		cube.position.x = Math.floor( ( Math.random() * 1000 - 500 ) / 50 ) * 50 + 25;
		cube.position.z = Math.floor( ( Math.random() * 1000 - 500 ) / 50 ) * 50 + 25;
		addToScene(cube);
	}
	


}

function addToScene(mesh){

	scene.addObject(mesh);



}