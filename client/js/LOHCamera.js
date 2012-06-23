LOH.SelectScreenCamera=function(scene){

	var camera=new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 100 );
	var projector = new THREE.Projector();
	camera.position.y=10;
	camera.position.z=20;
	var pos= new THREE.Vector4(camera.position.x,0,camera.position.z,1);
	scene.add(camera);
	target=new THREE.Vector4();
	
	this.update=function(delta){
		var mat=new THREE.Matrix4();
		mat.rotateY(delta*0.001);
		pos=mat.crossVector(pos);
		camera.position.x=pos.x;
		camera.position.z=pos.z;
		camera.lookAt(target);
	}
	
	this.getCamera=function(){
		return camera;
	}
 }
 
LOH.thirdPerson=function(dispatch,scene,input,targetID){	

	var camera=new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 20000 );
	var projector = new THREE.Projector();
	camera.position.x=0;
	camera.position.y=10;
	camera.position.z=10;
	scene.add(camera);
	var pos= new THREE.Vector4(camera.position.x,0,camera.position.z,1);
	
	target= scene.getChildByName(targetID);
	target.lookAt( pos.clone().negate().addSelf(target.position))
	camera.lookAt(target.position);
	
	dispatch['getrotation']=function(){
			return target.rotation;
	}
	
	this.update=function(delta){
		if (input.mouseDragOn){
			var mat=new THREE.Matrix4();
			mat.rotateY((input.downX - input.mouseX)*2*Math.PI/360);
			pos=mat.crossVector(pos);
			input.downX = input.mouseX;	
		}
		if(input.mouseLDown){
			
			var vector = new THREE.Vector3( ( input.mouseX / window.innerWidth ) * 2 - 1, - ( input.mouseY / window.innerHeight ) * 2 + 1 , 0.5 );
			projector.unprojectVector( vector, camera );

			var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

			var intersects = ray.intersectObjects( scene.__objects );

			if ( intersects.length > 0 ) {
				intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
			}
		}
		
		var move=new THREE.Vector4();
		if(input.mouseRDown){
			target.lookAt( pos.clone().negate().addSelf(target.position));
			dispatch['sendMoveObject'].call(input);
		}
		var mat=new THREE.Matrix4().setRotationFromEuler(target.rotation,target.eulerOrder);
		if(input.mouseRDown){
			if (input.left){
				move.x+=1
			}
			if (input.right){
				move.x+=-1
			}
		}else{
			if (input.left){
				mat.rotateY(delta*0.001);
			}
			if (input.right){
				mat.rotateY(-delta*0.001);
			}
		}
			target.rotation.getRotationFromMatrix( mat );
		if (input.forward){
			move.z+=1;
		}
		if (input.backward){
			move.z+=-1;
		}
		move=mat.crossVector(move);
		move.w=0;
		if(input.forward||input.backward||input.left||input.right)
			target.position.addSelf(move.normalize().multiplyScalar(delta*0.01))
		
		if (input.zoomCamera != 0 ){
			if( pos.length()+input.zoomCamera<100){
				if( pos.length()+input.zoomCamera>30){
					pos.setLength( pos.length()+input.zoomCamera );
				}else{
					pos.setLength(30);
				}
			}else{
				pos.setLength(100);
			}
			input.zoomCamera=0;
		}
		camera.position.x=target.position.x+pos.x;
		camera.position.y=target.position.y+(pos.lengthSq())/100;
		camera.position.z=target.position.z+pos.z;
		
		camera.lookAt(target.position);
	}

	this.getCamera=function(){return camera;}
 }