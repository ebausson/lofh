var THREE=require('./lib/three.js');
var DB=require('../DBacces.js');
SIZE=1*1000;
sqrt=Math.sqrt
module.exports=zoneHandler=function(data){
	this.id=data.id;
	this.position=new THREE.Vector3().copy(data.position);
	console.log("zone:",this.id)
	var adjacent={
		'NE':undefined
		,'E':undefined
		,'SE':undefined
		,'SO':undefined
		,'O':undefined
		,'NO':undefined
	};
	var adjacentVector={
		'NE':new THREE.Vector3(-SIZE*sqrt(3),0,-SIZE*1.5)
		,'E':new THREE.Vector3(-SIZE*sqrt(3),0,0)
		,'SE':new THREE.Vector3(-SIZE*sqrt(3),0,SIZE*1.5)
		,'SO':new THREE.Vector3(SIZE*sqrt(3),0,SIZE*1.5)
		,'O':new THREE.Vector3(SIZE*sqrt(3),0,0)
		,'NO':new THREE.Vector3(SIZE*sqrt(3),0,-SIZE*1.5)
	};
	var entities={};
	var elements={};
	this.compositeElements={};
	scene = new THREE.Scene();
	this.root=new THREE.Object3D();
	this.root.position=this.position;
	scene.add(this.root);

	this.getEntities=function(){return entities;}
		
	this.setAdjacent=function(rel,adj){
		adjacent[rel]=adj;
		scene.add(adj.root);
	}
	var lastUpdate=new Date().getTime();
	var update=true;
	var time;
	this.simulate=function(){
		var now = new Date().getTime();
		var dt = now - (time || now);
		if((now - lastUpdate)>1000){
			update=true;
			lastUpdate=now;
		}
		time = now;
		for(ent in entities){
			entity=entities[ent];
			if(update){
				ent.view=this.compositeElements;
			}
			if(entity.activ){
				var mat=new THREE.Matrix4().setRotationFromEuler(entity.rotation,'XYZ');
				mat.rotateY(entity.rotationmove*dt*entity.rotationspeed);
				entity.rotation.getRotationFromMatrix( mat );
				var tmp_move=mat.crossVector(entity.move);
				tmp_move.w=0;
				var rayFront = new THREE.Ray( entity.position, tmp_move.clone().normalize() );
				var intersectsFront = rayFront.intersectObjects( scene.__objects );
				if ( intersectsFront.length > 0)
					console.log('warning')
				if ( intersectsFront.length > 0 && tmp_move.length()>intersectsFront[0].distance ) {
					entity.move.set([0,0,0,1])
					console.log(collision)
				}else{
					var rayDown = new THREE.Ray( entity.position.clone().addSelf(new THREE.Vector3(0,5,0)), new THREE.Vector3(0,-5,0) );
					var intersectsDown = rayDown.intersectObjects( scene.__objects );
					tmp_move.normalize();
					if(intersectsFront.length > 0){
						dist= 5-intersectsFront[0].distance;
						if(dist*dist >1)
							dist=(dist>0)?1:-1;
						tmp_move.y=dist;
					}
					entity.position.addSelf(tmp_move.multiplyScalar(dt*entity.speed));
					ret=isOutside(entity);
					if(ret)
						if(adjacent[ret])
							passToAdjacent(entity);
						else
							entity.move.set([0,0,0,1])
				}
			}
		}
		if(update)update=false;
	}
	this.getElements=function(){return elements;}
	this.addElement=function(element){
		elements[element._id]=element;
		this.compositeElements[element._id]=element;
		for(adj in adjacent){
			if(adjacent[adj])
				adjacent[adj].compositeElements[element._id]=element;
		}
		this.root.add(element.mesh);
	}
	this.addEntity=function(entity){
		this.addElement(entity)
		entities[entity._id]=entity;
		ent.view=this.compositeElements;
	}
	this.receiveEntity=function(ent){
		this.addEntity(ent);
		this.root.add(ent.mesh);
	}
	function isOutside(ent){
		position=new THREE.Vector3().sub(ent.position,this.position);
		if(-sqrt(3)*position.x - position.z + SIZE < 0){
			return 'NE';
		}else if(position.x > SIZE*sqrt(3)/2){
			return 'E';
		}else if(sqrt(3)*position.x - position.z - SIZE > 0){
			return 'SE';
		}else if(-sqrt(3)*position.x - position.z - SIZE > 0){
			return 'SO';
		}else if(position.x < -SIZE*sqrt(3)/2){
			return 'O';
		}else if(sqrt(3)*position.x - position.z + SIZE < 0){
			return 'NO'
		}
		return 0;
	}
	function passToAdjacent(ent,zone){
		delete entities[ent._id];
		delete elements[ent._id];
		for(adj in adjacent){
			if(adjacent[adj])
				delete adjacent[adj].compositeElements[ent._id];
		}
		this.root.remove(ent.mesh);
		ent.zone=adjacent[zone];
		adjacent[zone].receiveEntity(ent)
	}
	this.IsPointInside=function(pos){
		position=new THREE.Vector3().sub(pos,this.position);
		var cnt=1;
		if(-sqrt(3)*position.x - position.z + SIZE > 0){
			cnt++
		if(position.x < SIZE*sqrt(3)/2){
			cnt++
		if(sqrt(3)*position.x - position.z - SIZE < 0){
			cnt++
		if(-sqrt(3)*position.x - position.z - SIZE < 0){
			cnt++
		if(position.x > -SIZE*sqrt(3)/2){
			cnt++
		if(sqrt(3)*position.x - position.z + SIZE > 0){
			return true;
		}}}}}}
		console.log("fail",cnt)
		pos.length()
		return false;
	}
	this.WorldRules=WorldRules={};
	WorldRules['target']=function(ent,data,timestamp){
		ent.target=data.target;
	}
	WorldRules['move']=function(ent,data,timestamp){
		ent.rotation.copy(data.rotation);
		ent.rotationmove=data.rotationmove;
		old_move=ent.move.clone();
		ent.move.copy(data.move);
		
		var now = new Date().getTime(),
		dt = now - (timestamp || now);
		if(ent.move.length()||ent.rotationmove){
			var mat=new THREE.Matrix4().setRotationFromEuler(ent.rotation,'XYZ');
			mat.rotateY(ent.rotationmove*dt*ent.rotationspeed);
			ent.rotation.getRotationFromMatrix( mat );
			var tmp_move=mat.crossVector(ent.move);
			tmp_move.w=0;
			ent.position.addSelf(tmp_move.multiplyScalar(dt*ent.speed));
			ent.activ=true;
		}else{
			var mat=new THREE.Matrix4().setRotationFromEuler(ent.rotation,'XYZ');
			mat.rotateY(ent.rotationmove*-dt*ent.rotationspeed);
			ent.rotation.getRotationFromMatrix( mat );
			tmp_move=mat.crossVector(old_move);
			tmp_move.w=0;
			ent.position.addSelf(tmp_move.multiplyScalar(-dt*ent.speed));
			ent.activ=false;
		}
	}
}