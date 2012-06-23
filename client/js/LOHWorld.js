LOH.World=function(dispatch,scene,ressources)
{
	
	var setTarget=function(id){
		this.target=id;
	}
	
	var getEntity=function(id){
		if(id=="target"){
			if(typeof(this.target)!='undefined')
			{
				return scene.getChildByName(this.target,false);
			}else{
				return 0;
			}
		}else{
			return scene.getChildByName(id,false);
		}
	}
	var addEntity=function(name,shapeID,materialID,position){
		mesh = new THREE.Mesh( getShape.call(this,shapeID), getMaterial.call(this,materialID) );
		mesh.name=name;
		scene.add(mesh);
	}

	var getShape=function(shapeID){
		if(ressources.geometries[shapeID]){
			return ressources.geometries[shapeID];
		}else{
			return ressources.geometries['cube'];
		}
	}
	
	var getMaterial=function(materialID){
		if(ressources.materials[materialID]){
			return ressources.materials[materialID];
		}else{
			return ressources.materials['lambert_red'];
		}
	}
	
	dispatch['sync']=function(data){
		for(ent in data){
			var tmp=scene.getChildByName(data[ent]._id,false);
			if(!tmp){
				addEntity.call(this,data[ent]._id,1,1);
				scene.getChildByName(data[ent]._id,false).position.copy(data[ent].position);
			}else{
				if((tmp.name!=this.target)||(new THREE.Vector4().sub(tmp.position,data[ent].position).length()>2)){
					tmp.position.copy(data[ent].position);
					tmp.rotation.copy(data[ent].rotation);
				}
			}
		}
	}
}

