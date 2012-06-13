LOH.thirdPerson=function(world,input)
 {	
	var camera=new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
	camera.position.x=10;
	camera.position.y=10;
	camera.position.z=10;
	world.scene.add(camera);
	
	target= world.getEntity("target");
	
	camera.lookAt(target.position);
	
	this.update=function(time)
	{
		var pos= new THREE.Vector4(camera.position.x-target.position.x,0,camera.position.z-target.position.z,1);
		
		if (input.moveForward) {
			target.position.x+=0.1;
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