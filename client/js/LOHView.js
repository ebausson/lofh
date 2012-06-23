/*
**
**
**
*/

LOH.SelectScreenView=function(dispatch,webGlContext,data){
	
	var GUI=new LOH.SelectScreenGUI(dispatch);
	
	webGlContext.domElement.appendChild(GUI.domElement);
	
	
	var loader = new THREE.SceneLoader();
	// loader.callbackSync = function(){};
	// loader.callbackProgress = function(){};
	
	
	scene = new THREE.Scene();
	callbackFinished=function(result){
		scene=result.scene;
		camera = new LOH.SelectScreenCamera(scene);
		ressource=result;
		animate();
	}
	
	var activ=true;
	var time;
	animate=function(){
		if(activ)
		requestAnimationFrame(animate);
		var now = new Date().getTime(),
		dt = now - (time || now);
		time = now;
		camera.update(dt);
		webGlContext.renderer.render( scene,camera.getCamera());
		webGlContext.stats.update();
	}
	console.log(data);
	loader.createScene(data,callbackFinished,"/static/");
	this.stop=function(){
		activ=false;
		webGlContext.domElement.removeChild(GUI.domElement);
	}
	
	window.addEventListener( 'resize', bind(this,onWindowResize), false );
	function onWindowResize( event ) {
	
		GUI.domElement.width = window.innerWidth;
		GUI.domElement.height = window.innerHeight;

		camera.getCamera().aspect = GUI.domElement.width/ GUI.domElement.height;
		camera.getCamera().updateProjectionMatrix();

	}
}

/*
**
**
**
*/
LOH.GameView=function(dispatch,webGlContext,data){

	var GUI=new LOH.GameGUI(dispatch);
	
	webGlContext.domElement.appendChild(GUI.domElement);
	
	
	var loader = new THREE.SceneLoader();
	// loader.callbackSync = function(){};
	// loader.callbackProgress = function(){};
	
	var input=new LOH.Input(dispatch,webGlContext.domElement);
	scene = new THREE.Scene();
	callbackFinished=function(result){
		scene=result.scene;
		scene.add(new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000, 100, 100),new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } )));
		camera = new LOH.thirdPerson(dispatch,scene,input,data.id);
		ressource=result;
		animate();
	}
	var activ=true;
	var time;
	animate=function(){
		if(activ)
			requestAnimationFrame(animate);
		var now = new Date().getTime(),
		dt = now - (time || now);
		time = now;
		camera.update(dt);
		webGlContext.renderer.render( scene,camera.getCamera());
		webGlContext.stats.update();
	}
	console.log(data);
	loader.createScene(data.ressource,callbackFinished,"/static/");

	var world = new LOH.World(dispatch,scene,ressource);
	this.stop=function(){
		activ=false;
	
	}
	window.addEventListener( 'resize', bind(this,onWindowResize), false );
	function onWindowResize( event ) {
	
		GUI.domElement.width = window.innerWidth;
		GUI.domElement.height = window.innerHeight;

		camera.getCamera().aspect = GUI.domElement.width/ GUI.domElement.height;
		camera.getCamera().updateProjectionMatrix();

	}
}







