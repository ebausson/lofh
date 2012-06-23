
LOH.WebGLBased=function(resolution){

	this.domElement=document.createElement('div');
	this.domElement.width=resolution.width;
	this.domElement.height=resolution.height;
	
	this.renderer = new THREE.WebGLRenderer({ clearColor: 0x000000, clearAlpha: 0.5 });
	this.renderer.setSize(this.domElement.width , this.domElement.height);
	this.domElement.appendChild( this.renderer.domElement );
	
	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.top = '0px';
	this.stats.domElement.style.zIndex = 100;
	this.domElement.appendChild( this.stats.domElement );
	window.addEventListener( 'resize', bind(this,onWindowResize), false );
	function onWindowResize( event ) {
	
		this.domElement.width = window.innerWidth;
		this.domElement.height = window.innerHeight;

		this.renderer.setSize( this.domElement.width, this.domElement.height );
	}
}

LOH.SelectScreenGUI=function(dispatch){
	
	this.domElement=document.createElement('div');
	
	var nameDiv=document.createElement('div');
	nameDiv.style.position = 'absolute';
	nameDiv.style.top = '10px';
	nameDiv.style.right = window.innerWidth/2+'px';
	
	var nameText=document.createElement('p');
	nameText.value='NAME:';
	nameDiv.appendChild(nameText);
	
	var nameField=document.createElement('input');
	nameField.type='text';
	nameField.style.top = '10px';
	nameField.style.right = '100px';
	nameDiv.appendChild(nameField);
	
	this.domElement.appendChild(nameDiv);
	
	var boutonPlay=document.createElement('input');
	boutonPlay.type='button';
	boutonPlay.onclick=function(){dispatch['play'](nameField.value);};
	boutonPlay.value='PLAY';
	boutonPlay.style.position = 'absolute';
	boutonPlay.style.bottom = '10px';
	boutonPlay.style.right = '10px';
	boutonPlay.style.zIndex = 100;
	this.domElement.appendChild(boutonPlay);
}

LOH.GameGUI=function(dispatch){
	this.domElement=document.createElement('div');
	
}