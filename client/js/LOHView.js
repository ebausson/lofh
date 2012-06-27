/*
**
**
**
*/

LOH.View=function(webGlContext){
	// scope=this;
	var activ=false;
	var GUI,camera,input;
	var GUIProfile={
		'LoadingScreen':{'GUI':LOH.LoadingGUI,'Camera':LOH.StaticCamera,'InitFunc':LoadingScreenInit}
		,'SelectScreen':{'GUI':LOH.SelectScreenGUI,'Camera':LOH.SelectScreenCamera,'InitFunc':SelectScreenInit}
		,'GameScreen':{'GUI':LOH.GameGUI,'Camera':LOH.thirdPersonCamera,'Input':LOH.Input,'InitFunc':GameScreenInit}
	}
	
	this.switchGUIProfil=function(mode,opt){
		activ=!activ;
		if(GUI){
			webGlContext.domElement.removeChild(GUI.domElement);
			delete GUI;
		}
		GUI=new GUIProfile[mode].GUI()
		webGlContext.domElement.appendChild(GUI.domElement);
		if(input){
			input.unbindListeners();
			delete input;
		}
		if(GUIProfile[mode].Input)
			input=new GUIProfile[mode].Input(webGlContext.domElement);
		if(camera){
			world.scene.remove(camera.getCamera());
			delete camera;
		}
		camera=new GUIProfile[mode].Camera(world,input);
		
		
		if(GUIProfile[mode].InitFunc)
			GUIProfile[mode].InitFunc.call(this,opt)
		animate();
	}
	
	function LoadingScreenInit(opt){
		world.scene=new THREE.Scene();
		world.scene.add(camera.getCamera());
		world.load(opt,bind(this,function(){
			this.switchGUIProfil(opt);
		}));
	}
	function SelectScreenInit(opt){
		world.scene=new THREE.Scene();
		world.scene.add(camera.getCamera());
		dispatch['ClientEvent']({"id":'SelectReady'})
		dispatch['play']=bind(this,function(data){
			this.switchGUIProfil('LoadingScreen','GameScreen');
			delete dispatch['play'];
		});
	}
	function GameScreenInit(opt){
		world.scene=new THREE.Scene();
		world.scene.add(camera.getCamera());
		dispatch['ClientEvent']({"id":'GameReady'})
	}
	var world = new LOH.World();
	
	
	var time;
	animate=function(){
		if(activ){
			requestAnimationFrame(animate);
			var now = new Date().getTime(),
			dt = now - (time || now);
			time = now;
			camera.update(dt);
			world.update(dt)
			webGlContext.renderer.render( world.scene,camera.getCamera());
			webGlContext.stats.update();
		}else{
			activ=true
		}
	}
	
	this.stop=function(){;}
	
	window.addEventListener( 'resize', bind(this,onWindowResize), false );
	function onWindowResize( event ) {
	
		GUI.domElement.width = window.innerWidth;
		GUI.domElement.height = window.innerHeight;

		camera.getCamera().aspect = GUI.domElement.width/ GUI.domElement.height;
		camera.getCamera().updateProjectionMatrix();

	}
}







