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
	localDispatch={};
	this.switchGUIProfil=function(mode,opt){
		activ=!activ;
		localDispatch={};
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
		world.reset();
		world.scene.add(camera.getCamera());
		world.load(opt,bind(this,function(){
			this.switchGUIProfil(opt);
		}));
	}
	function SelectScreenInit(opt){
		world.reset();
		world.scene.add(camera.getCamera());
		dispatch['ClientEvent']({"id":'SelectReady'})
		localDispatch['setCharacters']=function(params){
			GUI.init(params.data)
		}
		localDispatch['selectCharacter']=function(params){
			if(params.old)
				world.removeFromScene(params.old);
			if(params.select)
				world.addToScene(params.select);
			
		}
		dispatch['create']=bind(this,function(data){
			dispatch['ClientEvent']({'id':'CreateCharacter','which':data})
			this.switchGUIProfil('LoadingScreen','GameScreen');
			delete dispatch['create'];
		});
		dispatch['play']=bind(this,function(data){
			dispatch['ClientEvent']({'id':'play','which':data})
			this.switchGUIProfil('LoadingScreen','GameScreen');
			delete dispatch['play'];
		});
	}
	function GameScreenInit(opt){
		world.reset();
		world.scene.add(camera.getCamera());
		dispatch['ClientEvent']({"id":'GameReady'})
	}
	var world = new LOH.World();
	
	dispatch['Clientsync']=function(data){
		console.log('Clientsync(View):',data)
		localDispatch[data.func](data.params);
	}
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







