/*
**
**
**
*/

/**
objet Canvas
**/
function Canvas() {
	var renderer = new THREE.CanvasRenderer();
	renderer.setSize(window.innerWidth*3/4 , window.innerHeight*3/4);
	var canvas=renderer.domElement;
	var scene=new Scene();
	scene.fillScene();
	canvas.onmousedown=function(event)
	{
		if ('which' in event) {
			switch (event.which) {
			case 1://right
				scene.setPosMouse(event.clientX,event.clientY);
				canvas.onmousemove=scene.moveCam;
				break;
			case 2://middle
				//alert ("Middle button is pressed");
				break;
			case 3://left
				scene.setPosMouse(event.clientX,event.clientY);
				canvas.onmousemove=scene.moveCam;
				break;
			}
		}
	}
	canvas.onmouseup=function()
	{
		canvas.onmousemove={};
	}
	canvas.onmouseout=function()
	{
		canvas.onmousemove={};
	}
	document.onkeypress=scene.moveTarget;
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
		render();
	}

	var render=function()
	{
		//var timer = new Date().getTime() * 0.0001;
		renderer.render( scene.getScene(), scene.getCamera() );
	}
}









