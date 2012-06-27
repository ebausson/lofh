dispatch={};
LOH.Game=function(){
	
	var webGlContext=new LOH.WebGLBased({width:window.innerWidth,height:window.innerHeight})
	document.body.appendChild(webGlContext.domElement);
	var socket=new LOH.WSocket(function(){
		var view=new LOH.View(webGlContext);
		view.switchGUIProfil('LoadingScreen','SelectScreen');
	});
	
}
bind=function( scope, fn ) {
	return function () {fn.apply( scope, arguments );};
};