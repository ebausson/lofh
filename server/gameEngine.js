var THREE=require('./three.js');
exports.gameEntities=gameEntities={};
var activeEntities={};

Entity=function(name,position){
	this.position= position||new THREE.Vector3();
	this.name= name;
	this.materials= [ "lambert_red" ];
	this.rotation= new THREE.Vector3();
	this.scale= new THREE.Vector3(1,1,1);
	this.geometry="cube"
}

Mobile=function(name,position){
	Entity.call(this,name,position);
	this.speed=0.01
	this.rotationspeed=0.001;
	this.move=new THREE.Vector4();
	this.moveOrient=new THREE.Vector4(1,0,0,0);
	this.forward=false;
	this.backward=false;
	this.left=false;
	this.right=false;
}

exports.Character=Character=function(name,position){
	Mobile.call(this,name,position)
}

exports.CopyEntity=function(data){
	var ent=new Character();
	ent._id=data._id;
	ent.position= new THREE.Vector3().copy(data.position);
	ent.name= data.name;
	return ent;
}
//**************************************************
EntitySerializer=function(ent){
	return{
		"geometry"  : ent.geometry
		,"materials": ent.materials
		,"position" : [ ent.position.x, ent.position.y, ent.position.z ]
		,"rotation" : [ ent.rotation.x, ent.rotation.y, ent.rotation.z ]
		,"scale"	: [ ent.scale.x, ent.scale.y, ent.scale.z ]
		,"visible"  : true
	}
}
exports.viewSerializer=function(view){
	var tab={}
	for(ent in view){
		tab[ent]=EntitySerializer(view[ent]);
	}
	return tab;
}
//**************************************************
exports.gameRules=gameRules=new Array();
gameRules['target']=function(ent,data,timestamp){
	ent.target=data.target;
}
gameRules['move']=function(ent,data,timestamp){
	ent.rotation.copy(data.rotation);
	ent.forward=data.forward;
	ent.backward=data.backward;
	ent.left=data.left;
	ent.right=data.right;
	ent.rotationmove=data.rotationmove;
	var move=new THREE.Vector4();
	if (ent.left){
		move.x+=1
	}
	if (ent.right){
		move.x+=-1
	}
	if (ent.forward){
		move.z+=1;
	}
	if (ent.backward){
		move.z+=-1;
	}

	move.w=0;
	
	var now = new Date().getTime(),
	dt = now - (timestamp || now);
	if(ent.forward||ent.backward||ent.left||ent.right||ent.rotationmove){
		activeEntities[ent._id]={};
		var mat=new THREE.Matrix4().setRotationFromEuler(ent.rotation,'XYZ');
		mat.rotateY(ent.rotationmove*dt*ent.rotationspeed);
		ent.rotation.getRotationFromMatrix( mat );
		var tmp_move=mat.crossVector(move);
		tmp_move.w=0;
		ent.position.addSelf(tmp_move.normalize().multiplyScalar(dt*ent.speed));
	}else{
		var mat=new THREE.Matrix4().setRotationFromEuler(ent.rotation,'XYZ');
		mat.rotateY(ent.rotationmove*-dt*ent.rotationspeed);
		ent.rotation.getRotationFromMatrix( mat );
		tmp_move=mat.crossVector(ent.move);
		tmp_move.w=0;
		ent.position.addSelf(tmp_move.normalize().multiplyScalar(-dt*ent.speed));
		delete activeEntities[ent._id];
	}
	
	ent.move=move.normalize();
}

setInterval(applyRules,10)
var time;
function applyRules(){
	var now = new Date().getTime(),
	dt = now - (time || now);
	time = now;
	for(activ in activeEntities){
		var ent=gameEntities[activ];

		var mat=new THREE.Matrix4().setRotationFromEuler(ent.rotation,'XYZ');
		mat.rotateY(ent.rotationmove*dt*ent.rotationspeed);
		ent.rotation.getRotationFromMatrix( mat );
		tmp_move=mat.crossVector(ent.move);
		tmp_move.w=0;
		ent.position.addSelf(tmp_move.normalize().multiplyScalar(dt*ent.speed));			

	}
}
