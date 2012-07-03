var DB=require('../DBacces.js');
var ZoneHandler=require('./zoneHandler.js');
var Object3D=require('./Object3D.js');
module.exports=function(GameCompiler,callback){
	GameCompiler.setMapHandler(this);
	console.log('MAP')
	var map={}
	mapEntities={};
	mapElements={};
	zoneReady=0;
	DB.collection('map').findOne({'name':'test'},function(err,data){
		map.zones={}
		map.nbZones=0;
		for(id in data.zones){
			map.nbZones++;
			map.zones[data.zones[id].id]=new ZoneHandler(data.zones[id]);
		}
		for(adj in data.adjacent){
			a=data.adjacent[adj].a;
			b=data.adjacent[adj].b;
			map.zones[a.id].setAdjacent(a.rel,map.zones[b.id])
			map.zones[b.id].setAdjacent(b.rel,map.zones[a.id])
		}
		populate();
	});
	
	function populate(){
		DB.collection('mapElements').find({},function(err,dataM){
			console.log('mapElements:',dataM.length)
			for(i=0; i<dataM.length ; i++){
				console.log(dataM[i]._id)
				elem=Object3D.buildObjectFromData(GameCompiler.compile(dataM[i]));
				mapElements[elem._id]=elem;
				elem.zone.addElement(elem)
			}
			DB.collection('entities').find({},function(err,dataE){
				console.log('entities:',dataE.length)
				for(i=0; i<dataE.length ; i++){
					console.log(dataE[i]._id)
					ent=Object3D.buildObjectFromData(GameCompiler.compile(dataE[i]));
					mapEntities[ent._id]=ent;
					ent.zone.addEntity(ent)
				}
				callback(mapEntities,mapElements)
			});
		});
	}

	this.simulate=function(){
		for(zone in map.zones){
			map.zones[zone].simulate();
		}
	}
	this.getZone=function(id){
		return map.zones[id];
	
	}
	this.getZoneFromPosition=function(position){
		for(zone in map.zones){
			if(map.zones[zone].IsPointInside(position))
				return map.zones[zone]
		}
		return false
	}
	this.getZoneByDefault=function(){
		for(zone in map.zones){
			return map.zones[zone]
		}
	}
}
