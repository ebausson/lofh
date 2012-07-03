LOH.World=function()
{
	scopeW=this;
	this.scene=new THREE.Scene();

	var objects={};
	var avatar;
	var selection;
	this.reset=function(){
		this.scene=new THREE.Scene();
		
		objects={};
		avatar=0;
		selection=0;
	
	}
	
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
		selection=objects[mesh.entId];
		console.log(mesh.entId)
		selection.select();
		dispatch['GameEvent']({
			"func":"target"
			,"data":{"target":selection.id}
		});
	}	
	this.getSelection=function(){
		selection=selection||new LOH.Entity(LOH.DummyEntity);
		return selection;
	}
	this.update=function(dt){
		for(num in objects)
			objects[num].update(dt);
	}
	
	this.load=function(which,callback){
		LOH.Ressources.getRessource(which,callback);
	}
	
	var addEntity=function(data){
		ent=new LOH.Entity(data);
		objects[data._id]=ent;
		scopeW.scene.add(ent.getMesh());
	}
	var addMapElement=function(data){
		elem=new LOH.MapElement(data);
		objects[data._id]=elem;
		scopeW.scene.add(elem.getMesh());
		if(data.pattern=="ground"){
			hexa=[[0,0,0]]
			for (i = 0; i < 6; i++) {
			  hexa.push([ Math.sin(2 * Math.PI * i / 6),0, Math.cos(2 * Math.PI * i / 6)]);
			}
			mesh=new THREE.Mesh(new THREE.PolyhedronGeometry(hexa,[[0,1,2],[0,2,3],[0,3,4],[0,4,5],[0,5,6],[0,6,1]],1000))
			mesh.position=new Vec3(elem.position.x,0,elem.position.z)
			scopeW.scene.add(mesh);
		}
	}
	this.addToScene=function(id){
		this.scene.add(objects[id].getMesh());
	}
	this.removeFromScene=function(id){
		this.scene.remove(objects[id].getMesh())
	}
	dispatch['Gamesync']=function(data){
		var now = new Date().getTime(),
		dt = now - (data.timestamp || now);
		for(id in data.objects){
			ent=data.objects[id];
			var tmp=objects[id];
			if(!tmp){
				if(ent.type=="Env")
					addMapElement(ent);
				else
					addEntity(ent);
			}else{
				if((tmp!=avatar)||(new Vec3().copy(ent.position).subSelf(tmp.getPosition()).length()>10)){
					tmp.synchronize(ent,dt);
				}
			}
		}
		for(id in data.preload){
			ent=new LOH.Entity(data.preload[id]);
			if(data.preload[id]._id!=0){
				objects[data.preload[id]._id]=ent;
			}else{
				objects[data.preload[id].name]=ent;
			
			}
		}
		if(data.more){
		console.log(data.more.avatar)
			if(data.more.avatar)
				avatar=objects[data.more.avatar];
			
			for(id in data.more.ligths){
				ligth=LOH.Ressources.getRessource({'type':'lights','id':data.more.ligths[id]},function(){})
				scopeW.scene.add(ligth)
			}
			
		}
	};
}