LOH.thirdPerson=function(world,input)
 {	
	var camera=new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
	var projector = new THREE.Projector();
	camera.position.x=10;
	camera.position.y=10;
	camera.position.z=10;
	world.scene.add(camera);
	var pos= new THREE.Vector4(camera.position.x,0,camera.position.z,1);
	target= world.getEntity("target");
	
	camera.lookAt(target.position);
	
	this.update=function(time)
	{	
	
		if(input.mouseLDown)
		{
			
			var vector = new THREE.Vector3( ( input.mouseX / window.innerWidth ) * 2 - 1, - ( input.mouseY / window.innerHeight ) * 2 + 1 , 0.5 );
			projector.unprojectVector( vector, camera );

			var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

			var intersects = ray.intersectObjects( world.scene.__objects );

			if ( intersects.length > 0 ) {

				intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );

			}
		}
		

	//---------------------------
		
		if (input.moveForward) {
			target.position.addSelf(pos.clone().normalize().negate());
		}
		if (input.moveBackward) {
			target.position.addSelf(pos.clone().normalize());
		}
		if (input.moveLeft) {
			var mat=new THREE.Matrix4();
			mat.rotateY(90*2*Math.PI/360);
			var pos2=mat.crossVector(pos);
			target.position.addSelf(pos2.normalize().negate());
		}
		if (input.moveRight) {
			var mat=new THREE.Matrix4();
			mat.rotateY(90*2*Math.PI/360);
			var pos2=mat.crossVector(pos);
			target.position.addSelf(pos2.normalize());
		}
		
		
		
		if (input.zoomCamera != 0 )
		{
			if( pos.length()+input.zoomCamera<100)
			{
				if( pos.length()+input.zoomCamera>30)
				{
					pos.setLength( pos.length()+input.zoomCamera );
				}else{
					pos.setLength(30);
				}
			}else{
				pos.setLength(100);
			}
			input.zoomCamera=0;
		}
		if (input.mouseDragOn) {
			var mat=new THREE.Matrix4();
			mat.rotateY((input.downX - input.mouseX)*2*Math.PI/360);
			pos=mat.crossVector(pos);
			input.downX = input.mouseX;	
		}
		camera.position.x=target.position.x+pos.x;
		camera.position.y=target.position.y+(pos.lengthSq())/100;
		camera.position.z=target.position.z+pos.z;
		
		camera.lookAt(target.position);
		
	}

	this.getCamera=function()
	{
		return camera;
	}
 }