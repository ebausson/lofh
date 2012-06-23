LOH.Game=function(){
	var dispatch={};
	var webGlContext=new LOH.WebGLBased({width:window.innerWidth,height:window.innerHeight})
	document.body.appendChild(webGlContext.domElement);
	dispatch['selectScreen']=function(data){
		var GUI=new LOH.SelectScreenView(dispatch,webGlContext,data);
		delete dispatch['selectScreen']
		dispatch['GameScreen']=function(data){
			GUI.stop();
			GUI=new LOH.GameView(dispatch,webGlContext,data);
			delete dispatch['GameScreen']
		};
	};
	new LOH.WSocket(dispatch);
}
bind=function( scope, fn ) {
	return function () {

		fn.apply( scope, arguments );

	};

};