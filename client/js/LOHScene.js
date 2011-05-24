

function Scene()
{
	var scene = new THREE.Scene();
	this.getScene=function()
	{
		return scene;
	}
	var cube=new THREE.Cube( 50, 50, 50 );
	var material=new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading } ) ;
	var target=new THREE.Mesh(cube, material);
	
	var camera=new THREE.Camera( 60, window.innerWidth / window.innerHeight, 1, 10000,target);
	camera.position.x=200;
	camera.position.y=100;
	camera.position.z=200;
	this.getCamera=function()
	{
		return camera;
	}
	var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
	scene.addLight( ambientLight );
	var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
	directionalLight.position.x = Math.random() - 0.5;
	directionalLight.position.y = Math.random() - 0.5;
	directionalLight.position.z = Math.random() - 0.5;
	directionalLight.position.normalize();
	scene.addLight( directionalLight );
	this.fillScene=function()
	{
		target.overdraw = true;
		scene.addObject(target);
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( - 500, 0, 0 ) ) );
		geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( 500, 0, 0 ) ) );

		for ( var i = 0; i <= 20; i ++ ) {

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.z = ( i * 50 ) - 500;
			scene.addObject( line );

			var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } ) );
			line.position.x = ( i * 50 ) - 500;
			line.rotation.y = 90 * Math.PI / 180;
			scene.addObject( line );

		}

		// Cubes

		var geometry = new THREE.Cube( 50, 50, 50 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading } );

		for ( var i = 0; i < 100; i ++ ) {

			cube = new THREE.Mesh( geometry, material );
			cube.overdraw = true;

			cube.scale.y = Math.floor( Math.random() * 2 + 1 );

			cube.position.x = Math.floor( ( Math.random() * 1000 - 500 ) / 50 ) * 50 + 25;
			cube.position.y = ( cube.scale.y * 50 ) / 2;
			cube.position.z = Math.floor( ( Math.random() * 1000 - 500 ) / 50 ) * 50 + 25;

			scene.addObject(cube);

		}
	}
	this.addToScene=function(mesh)
	{
		scene.addObject(mesh);
	}
	this.moveTarget=function(event)
	{
		if ('which' in event) 
		{
			switch (event.keyCode) 
			{
			case 38://up
				target.position.z = target.position.z+10;
				break;
			case 40://down
				target.position.z = target.position.z-10;
				break;
			case 37://left
				target.position.x = target.position.x+10;
				break;
			case 39://right
				target.position.x = target.position.x-10;
				break;
			}
			camera.position.x=camera.target.position.x+Math.cos( camPos.x*0.05 )*100;
			camera.position.z=camera.target.position.z+Math.sin( camPos.x*0.05 )*100;
		}
	}
	var mousePos=new THREE.Vector3(0,0,0);
	var camPos=new THREE.Vector3(0,0,0);
	this.setPosMouse=function(x,y)
	{
		mousePos.x=x;
		mousePos.y=y;
	}
	this.moveCam=function(event)
	{
		if(event.clientX>mousePos.x)
			camPos.x++;
		else
			camPos.x--;
		camera.position.x=camera.target.position.x+Math.cos( camPos.x*0.05 )*100;
		camera.position.z=camera.target.position.z+Math.sin( camPos.x*0.05 )*100;
		mousePos.x=event.clientX;
			
		// if(event.clientY>mousePos.y)
			// camera.position.x-=10;
		// else
			// camera.position.x+=10;
		// mousePos.y=event.clientY;
	}
}
