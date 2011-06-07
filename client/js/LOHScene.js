

function Scene()
{
	var scene = new THREE.Scene();
	this.getScene=function()
	{
		return scene;
	}
	
	var camera=new THREE.Camera( 0, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.x=200;
	camera.position.y=200;
	camera.position.z=100;
	var comp=new THREE.Vector3(0,100,0);
	this.getCamera=function()
	{
		return camera;
	}
	this.addToScene=function(mesh)
	{
		scene.addObject(mesh);
	}
	this.turnCamera=function(rot)
	{
		comp.x=(comp.x+rot)%360;
		camera.position.x=camera.target.position.x+Math.cos( comp.x*2*Math.PI/360 )*comp.y;
		camera.position.z=camera.target.position.z+Math.sin( comp.x*2*Math.PI/360 )*comp.y;
	}
	this.moveCamera=function(x,y,z)
	{
		camera.position.x=camera.target.position.x+Math.cos( comp.x )*comp.y;
		camera.position.y=camera.target.position.y+Math.sin( comp.x )*comp.y;
	}
	this.zoomCamera=function(rot)
	{
		camera.position.x=camera.target.position.x+Math.cos( comp.x )*comp.y;
		camera.position.y=camera.target.position.y+Math.sin( comp.x )*comp.y;
	}
}
