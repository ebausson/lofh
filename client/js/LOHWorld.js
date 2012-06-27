LOH.World=function()
{
	scope=this;
	this.scene=new THREE.Scene();
	var entities={};
	
	var avatar;
	var selection;
	this.getAvatar=function(){
		avatar=avatar||new LOH.Entity(LOH.DummyEntity);
		return avatar;
	}
	dispatch['updateAvatarMove']=function(input){
		var move=new Vec4();
		var rotationmove=0;
		if(input.mouseRDown){
			if (input.left){
				move.x+=1
			}
			if (input.right){
				move.x+=-1
			}
		}else{
			if (input.left){
				rotationmove+=1;
			}
			if (input.right){
				rotationmove-=1;
			}
		}
		if (input.forward){
			move.z+=1;
		}
		if (input.backward){
			move.z+=-1;
		}
		avatar.SetRotationMove(rotationmove);
		avatar.SetMove(move);
		dispatch['GameEvent']({
			'func':'move'
			,'data':{
				'rotation':avatar.getRotation()
				,'move':avatar.getMove()
				,'rotationmove':avatar.getRotationMove()
			}
		});
	}
	
	this.changeSelection=function(mesh){
		if(selection)
			selection.unselect();
		selection=entities[mesh.entId];
		selection.select();
		dispatch['GameEvent']({
			"func":"target"
			,"data":{"target":selection.id}
		});
	}
	
	this.update=function(dt){
		for(num in entities)
			entities[num].update(dt);
	}
	
	this.load=function(which,callback){
		LOH.Ressources.getRessource(which,callback);
	}
	
	var addEntity=function(data){
		ent=new LOH.Entity(data);
		entities[data._id]=ent;
		scope.scene.add(ent.getMesh());
	}
	
	dispatch['sync']=function(data){
		var now = new Date().getTime(),
		dt = now - (data.timestamp || now);
		for(id in data.objects){
			ent=data.objects[id];
			var tmp=entities[id];
			if(!tmp){
				addEntity(ent);
			}else{
				if((tmp!=avatar)||(new Vec3().copy(ent.position).subSelf(tmp.getPosition()).length()>10)){
					tmp.synchronize(ent,dt);
				}
			}
		}
		if(data.more){
			if(data.more.avatar)
				avatar=entities[data.more.avatar];
			
			for(id in data.more.ligths){
				ligth=LOH.Ressources.getRessource({'type':'lights','id':data.more.ligths[id]},function(){})
				scope.scene.add(ligth)
			}
		}
	};
}