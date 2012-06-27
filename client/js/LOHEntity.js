LOH.Entity=function(data){
	
	var id=data._id;
	var position=new Vec3().copy(data.position);
	var rotation=new Vec3().copy(data.rotation);
	var scale=new Vec3().copy(data.scale);
	var mesh=LOH.PatternFactory(LOH.Ressources.getRessource({'type':'patterns','id':data.pattern},function(pattern){mesh=LOH.PatternFactory(pattern)}),id);
	mesh.position=position;
	mesh.rotation=rotation;
	mesh.scale=scale;
	var move=new Vec4().copy(data.move);
	var rotationmove=data.rotationmove||0;
	var rotationspeed=data.rotationspeed||0.001;
	this.select=function(){
		mesh.add(LOH.PatternFactory(LOH.Ressources.getRessource({'type':'patterns','id':'selection'},function(){}),id));
	}
	this.unselect=function(){
		select=mesh.getChildByName("selection",true)
		mesh.remove(select);
	}
	this.changeStand=function(stand){
		action=mesh.actions[stand]
		for(part in action){
			if(part == 'self'){
				mesh.currentAnimation=action[part];
			}else{
				mesh.getChildByName(part,true).currentAnimation=action[part]
			}
		}
	}

	this.update=function(dt){
		var mat=new THREE.Matrix4().setRotationFromEuler(rotation,mesh.eulerOrder);
		mat.rotateY(rotationmove*dt*rotationspeed);
		rotation.getRotationFromMatrix( mat );
		tmp_move=mat.crossVector(move);
		tmp_move.w=0;
		if(tmp_move.length()>0){
			this.changeStand('walk');
		}else{
			this.changeStand('stand');
		}
		position.addSelf(tmp_move.normalize().multiplyScalar(dt*0.01))
		anim(mesh);
	}
	anim=function(m){
		for(child in m.children)
			anim(m.children[child]);
		if(m.currentAnimation && m.morphTargetBase){
			m.animations[m.currentAnimation].lastKeyframe = m.animations[m.currentAnimation].lastKeyframe||0;
			m.animations[m.currentAnimation].currentKeyframe = m.animations[m.currentAnimation].currentKeyframe||0;
			var tme = new Date().getTime() % m.animations[m.currentAnimation].duration;

			var keyframe = m.animations[m.currentAnimation].start+Math.floor( tme / m.animations[m.currentAnimation].interpolation );

			if ( keyframe != m.currentKeyframe ) {

				m.morphTargetInfluences[ m.lastKeyframe ] = 0;
				m.morphTargetInfluences[ m.currentKeyframe ] = 1;
				m.morphTargetInfluences[ keyframe ] = 0;

				m.lastKeyframe = m.currentKeyframe;
				m.currentKeyframe = keyframe;

				// console.log( m.morphTargetInfluences );

			}

			m.morphTargetInfluences[ keyframe ] = ( tme % m.animations[m.currentAnimation].interpolation ) / m.animations[m.currentAnimation].interpolation;
			m.morphTargetInfluences[ m.lastKeyframe ] = 1 - m.morphTargetInfluences[ keyframe ];
		}
		
	
	}
	this.synchronize=function(syncdata,dt){
		position.copy(syncdata.position);
		rotation.copy(syncdata.rotation);
		move.copy(syncdata.move);
		rotationmove=syncdata.rotationmove;
		var mat=new THREE.Matrix4().setRotationFromEuler(rotation,mesh.eulerOrder);
		mat.rotateY(rotationmove*dt*rotationspeed);
		rotation.getRotationFromMatrix( mat );
		tmp_move=mat.crossVector(move);
		tmp_move.w=0;
		position.addSelf(tmp_move.normalize().multiplyScalar(dt*syncdata.speed))
	}
	//geter
	this.getMesh=function(){return mesh;}
	this.getPosition=function(){return position;}
	this.getRotation=function(){return rotation;}
	this.getMove=function(){return move;}
	this.getRotationMove=function(){return rotationmove;}
	//seter
	this.SetRotationMove=function(rotation){rotationmove=rotation;}
	this.SetMove=function(mov){move=mov;}
};
LOH.DummyEntity={
	id:1
	,position:new Vec3()
	,rotation:new Vec3()
	,scale:new Vec3(1,1,1)
	,move:new Vec4()
	,pattern:'cube'
};
LOH.PatternFactory=function(pattern,entId){
	var mesh,geometry,materials;
	if(pattern.geometry && pattern.materials){
		geometry=LOH.Ressources.getRessource({'type':'geometries','id':pattern.geometry},function(geo){geometry=geo;});
		materials=LOH.Ressources.getRessource({'type':'materials','id':pattern.materials},function(mat){materials=mat;});
		mesh=new THREE.Mesh(geometry,materials);
	}else{
		mesh=new THREE.Object3D();
	}
	
	if(pattern.position)
		mesh.position.set(pattern.position[0],pattern.position[1],pattern.position[2]);
	if(pattern.rotation)
		mesh.rotation.set(pattern.rotation[0],pattern.rotation[1],pattern.rotation[2]);
	if(pattern.scale)
		mesh.scale.set(pattern.scale[0],pattern.scale[1],pattern.scale[2]);
	mesh.actions=pattern.actions||{};
	mesh.animations=pattern.animations||{};
	mesh.currentAnimation=0;
	mesh.visible = pattern.visible||true;
	mesh.doubleSided = pattern.doubleSided||false;
	mesh.castShadow = pattern.castShadow||false;
	mesh.receiveShadow = pattern.receiveShadow||false;
	mesh.name=pattern.name;
	mesh.entId=entId;
	for(child in pattern.childs){
		mesh.add(LOH.PatternFactory(pattern.childs[child],entId));
	}
	return mesh;
}