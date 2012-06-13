/*
**
**
**
*/

/**
objet Canvas
**/
LOH.Canvas=function(stats)
{
	
	var renderer = new THREE.WebGLRenderer({ clearColor: 0x000000, clearAlpha: 0.5 });
	renderer.setSize(window.innerWidth , window.innerHeight);
	var canvas=renderer.domElement;
	var input=new Input(canvas);
	var scene = new THREE.Scene();
	var world=new LOH.World(scene);
	var socket=new LOH.WSocket(world);
	world.initMonde();
	var thirdperson;
	
	document.body.oncontextmenu=function()
	{
		return false;
	}
	
	this.getCanvas=function()
	{
		return canvas;
	}
	this.refreshCanvas=function()
	{
		animate();
	}
	var animate=function()
	{
		requestAnimationFrame(animate);
		socket.update();
		if (thirdperson){
			thirdperson.update();
			render();
		}else{
			if(world.getEntity("target")){
				thirdperson=new LOH.thirdPerson(world,input);
			}
		}
		
		
		stats.update();
	}

	var render=function()
	{
		//var timer = new Date().getTime() * 0.0001;
		renderer.render( scene, thirdperson.getCamera() );
	}
}









