Object3D=function(){
	//***********************
	this.zone;
	this.position=new THREE.Vector3();
	this.name="NAME";
	//******************
	var box_geometry = new THREE.CubeGeometry( 10, 10, 10 )
	this.mesh = new THREE.Mesh(box_geometry);
	

	this.rotation= new THREE.Vector3();
	this.scale= new THREE.Vector3(1,1,1);
	
	this.mesh.position=this.position;
	this.mesh.rotation=this.rotation;
	this.mesh.scale=this.scale;
	

	this.activ=false;
	
	this.META=function(){
		return {
		'_id':this._id
		,'name':this.name
		,'pattern':this.pattern
		}
	}
	this.PERSIT=function(){
		return {
		'_id':this._id
		,'name':this.name
		,'type':this.type
		,'pattern':this.pattern
		,'position':this.position
		,'rotation':this.rotation
		,'scale':this.scale
		}
	}
}
type={}
Mobile=function(){
	Object3D.call(this);
	this.METASPATIAL=function(){
		return {
		'_id':this._id
		,'name':this.name
		,'type':this.type
		,'pattern':this.pattern
		,'position':this.position
		,'rotation':this.rotation
		,'scale':this.scale
		,'move':this.move
		,'rotationmove':this.rotationmove
		}
	}
	this.speed=0.01
	this.rotationspeed=0.001;
	this.rotationmove=0;
	this.move=new THREE.Vector4();
}

type['Character']=exports.Character=function(){
	Mobile.call(this)
	this.view={};
}
type['Env']=exports.Ground=function(){
	Object3D.call(this);
	//="ground"
	this.METASPATIAL=function(){
		return {
		'_id':this._id
		,'name':this.name
		,'type':this.type
		,'pattern':this.pattern
		,'position':this.position
		,'rotation':this.rotation
		,'scale':this.scale
		}
	}
}
//*****************************************
exports.buildObjectFromData=function(data){
	var ent=new type[data.type]();
	ent.name=data.name;
	ent.zone=data.zone;
	ent.position=data.position;
	ent._id=data._id;
	ent.rotation=data.rotation;
	ent.scale=data.scale;
	ent.type= data.type;
	ent.pattern=data.pattern;
	return ent;
}
//**************************************************
EntitySerializer=function(ent){
	return{
		"pattern"  : ent.pattern
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