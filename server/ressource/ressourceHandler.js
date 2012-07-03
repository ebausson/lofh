var DB=require('../DBacces.js');
exports.getRessource=function(req,callback){
	result={}
	if(req == 'GameScreen'|| req == 'SelectScreen'){
		DB.collection('ressources').find({/*'pack':req*/},function(err,pack){
			for(ress in pack){
				if(!result[pack[ress].type])
					result[pack[ress].type]={}
				result[pack[ress].type][pack[ress].name]=pack[ress].data;
			}
			callback({'id':req,'ressource':result});
		});
	}else{
		DB.collection('ressources').find({'name':req},function(err,ress){
			result[ress.type]={}
			result[ress.type][ress.name]=ress.data;
			callback({'id':req,'ressource':result});
		});
	}
}