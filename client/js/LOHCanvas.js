/*
**
**
**
*/

/**
objet Canvas
**/
function Canvas() {
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth*3/4 , window.innerHeight*3/4);
	var canvas=renderer.domElement;
	var scene=new Scene();
	var lastXclic=0;
	var lastYclic=0;
	canvas.onmousedown=function(event)
	{
		if ('which' in event) {
			switch (event.which) {
			case 1://left
			var geometry = new THREE.Sphere( 100, 14, 7, false );

				var material =  new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'textures/land_ocean_ice_cloud_2048.jpg' ) } );



					var sphere = new THREE.Mesh( geometry, material );
					sphere.overdraw = true;

					sphere.position.x = 0;
					sphere.position.z = 0;


					scene.getScene().addObject( sphere );

				break;
			case 2://middle
				//alert ("Middle button is pressed");
				break;
			case 3://right
				lastXclic=event.clientX;
				lastYclic=event.clientY;
				canvas.onmousemove=function(event)
				{
					scene.turnCamera((event.clientX-lastXclic)/10);
					lastXclic=event.clientX;
				}
				break;
			}
		}
	}
	canvas.onmousewheel=function(event)
	{
		if ('which' in event) {
			
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
	document.onkeypress=function(event)
	{
		if ('which' in event) 
		{
			// switch (event.keyCode) 
			// {
			// case 38://up
				// camera.target.position.z +=10;
				// break;
			// case 40://down
				// camera.target.position.z -=10;
				// break;
			// case 37://left
				// camera.target.position.x +=10;
				// break;
			// case 39://right
				// camera.target.position.x -=10;
				// break;
			// }
		}
	}
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









