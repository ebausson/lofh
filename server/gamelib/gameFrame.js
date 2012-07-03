var THREE=require('./lib/three.js');
var ObjectId = require('bson').ObjectID;
var DB=require('../DBacces.js');
var Physijs=require('./lib/physi.js');
var mapFactory=require('./mapHandler.js');
var Object3D=require('./Object3D.js');
var GameCompiler=require('./gameCompiler.js');


var map;
var gameEntities={};
var gameElements={};
module.exports=GameFrame=function(callback){
	console.log('GameFrame')
	map=new mapFactory(GameCompiler,function(entities,elements){
		gameEntities=entities;
		gameElements=elements;
		setInterval(map.simulate,10);
		setInterval(saveState,10*1000);
		callback();
	});
	this.createEntity=function(data,callback){
		var ent=Object3D.buildObjectFromData(GameCompiler.compile(data));
		meta=ent.METASPATIAL();
		DB.collection('entities').insert(meta,function(err,data){
			ent._id=meta._id;
			gameEntities[ent._id]=ent;
			ent.zone.addEntity(ent);
			callback(ent);
		});
	}
	this.getEntity=function(id){
		return gameEntities[id]
	}
	this.getView=function(entity){
		entities=entity.view;
		result={}
		for(ent in entities){
			result[ent]=entities[ent].METASPATIAL();
		}
		return result;
	}
	this.getPreloadSlotID=function(entities){
		result={}
		for(ent in entities){
			if(gameEntities[entities[ent]]){
				result[entities[ent]]=gameEntities[entities[ent]].META();
			}else{
				result[ent]={'_id':0,'name':ent,'pattern':'cube'};
			}
		}
		return result;
	}
	this.getMETAObject=function(objects){
		result={}
		for(id in objects){
			result[id]=objects[id].METASPATIAL();
		}
		return result;
	}

	saveState=function(){
		
		for(ent in gameEntities){
			DB.collection('entities').save(gameEntities[ent].PERSIT())
		}
		console.log('save DONE')
	}
	setInterval(map.simulate,10);
	setInterval(saveState,60*1000);
	return this;
}
