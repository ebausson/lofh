var THREE=require('./lib/three.js');
var mapHandler;
exports.setEnv=function(){}
exports.compile=function(data){
	result=data
	if(data.position)result.position=new THREE.Vector3().copy(data.position);
	if(data.rotation)result.rotation=new THREE.Vector3().copy(data.rotation);
	if(data.scale)result.scale=new THREE.Vector3().copy(data.scale);
	result.zone=mapHandler.getZoneFromPosition(result.position);
	if(!result.zone)
		result.zone=mapHandler.getZoneByDefault()
	return result;
}
exports.setMapHandler=function(MH){mapHandler=MH;}
