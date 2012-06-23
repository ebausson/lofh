
LOH.Input=function(dispatch,domElement){
	
	this.forward = false;
	this.backward = false;
	this.left = false;
	this.right = false;
	
	var moveForward = function(state){
		if(this.forward != state){
			this.forward = state;
			dispatch['sendMoveObject'].call(this);
		}
		
	};
	var moveBackward = function(state){
		if(this.backward != state){
			this.backward = state;
			dispatch['sendMoveObject'].call(this);
		}
	};
	var moveLeft = function(state){
		if(this.left !=state){
			this.left = state;
			dispatch['sendMoveObject'].call(this);
		}
	};
	var moveRight = function(state){
		if(this.right !=state){
			this.right = state;
			dispatch['sendMoveObject'].call(this);
		}
	};
	
	dispatch['sendMoveObject']=function(){
		var obj={
			'func':'move'
			,'data':{
				'rotation':dispatch["getrotation"]()
				,'forward':this.forward
				,'backward':this.backward
			}
		}
		if(this.mouseRDown){
			obj.data.rotationmove=0
			if(this.downX>this.mouseX)
				obj.data.rotationmove+=1
			if(this.downX>this.mouseX)
				obj.data.rotationmove-=1
			obj.data.left=this.left;
			obj.data.right=this.right;
		}else{
			obj.data.rotationmove=0
			if(this.left)
				obj.data.rotationmove+=1
			if(this.right)
				obj.data.rotationmove-=1
		}
		dispatch['event'](obj)
	}
	
	var keyMap=[];
	//move forward (38:up,87:'z')
	keyMap[38]={
			onKeyDown:bind(this,function(){moveForward.call(this,true)})
			,onKeyUp:bind(this,function(){moveForward.call(this,false)})
		}
	keyMap[90]={
			onKeyDown:bind(this,function(){moveForward.call(this,true)})
			,onKeyUp:bind(this,function(){moveForward.call(this,false)})
		}
	//move left (37:left,81:'q')
	keyMap[37]={
			onKeyDown:bind(this,function(){moveLeft.call(this,true)})
			,onKeyUp:bind(this,function(){moveLeft.call(this,false)})
		}
	keyMap[81]={
			onKeyDown:bind(this,function(){moveLeft.call(this,true)})
			,onKeyUp:bind(this,function(){moveLeft.call(this,false)})
		}
	//move back (40:down,83:'s')
	keyMap[40]={
			onKeyDown:bind(this,function(){moveBackward.call(this,true)})
			,onKeyUp:bind(this,function(){moveBackward.call(this,false)})
		}
	keyMap[83]={
			onKeyDown:bind(this,function(){moveBackward.call(this,true)})
			,onKeyUp:bind(this,function(){moveBackward.call(this,false)})
		}
	//move right (39:right,68:'d')
	keyMap[39]={
			onKeyDown:bind(this,function(){moveRight.call(this,true)})
			,onKeyUp:bind(this,function(){moveRight.call(this,false)})
		}
	keyMap[68]={
			onKeyDown:bind(this,function(){moveRight.call(this,true)})
			,onKeyUp:bind(this,function(){moveRight.call(this,false)})
		}
	
	this.onKeyDown=function ( event ) {
			//event.preventDefault();
			event.stopPropagation();
		try{
			keyMap[event.which].onKeyDown.call(this);
		}catch(err){}
	}

	this.onKeyUp= function ( event ) {
			//event.preventDefault();
			event.stopPropagation();
		try{
			keyMap[event.which].onKeyUp.call(this);
		}catch(err){}
	}
	
	
	//----------------------------------------------------------
	//-----------------------------------------------------------
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	this.domElement.oncontextmenu=function(){return false;}
	this.mouseX = 0;
	this.mouseY = 0;
	
	this.downX = 0;
	this.downY = 0;
	
	this.zoomCamera=0;
	this.mouseDragOn = false;
	this.mouseRDown = false;
	this.mouseLDown = false;
	
	this.mousewheel = function ( event ) {
		event.preventDefault();
		event.stopPropagation();
		if(event.wheelDelta)
			if (event.wheelDelta>0)
				this.zoomCamera=-1;
			else
				this.zoomCamera=1;
		else
			if (event.detail>0)
				this.zoomCamera=1;
			else
				this.zoomCamera=-1;
	}
	
	this.onMouseDown = function ( event ) {
		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		switch ( event.button ) {
			case 0:
				this.mouseLDown=true;
				break;
			case 2: 
				this.downX=this.mouseX;
				this.mouseRDown = true;
				break;
		}
	};

	this.onMouseUp = function ( event ) {
		event.preventDefault();
		event.stopPropagation();

		switch ( event.button ) {

			case 0: 
				this.mouseLDown = false;
				break;
			case 2: 
				this.downX=0;
				this.mouseRDown = false;
				this.mouseDragOn = false;
				break;
		}
		
	};
	
	this.onMouseMove = function ( event ) {

		if ( this.domElement === document ) {

			this.mouseX = event.pageX;
			this.mouseY = event.pageY;

		} else {

			this.mouseX = event.pageX - this.domElement.offsetLeft ;
			this.mouseY = event.pageY - this.domElement.offsetTop;

		}
		if(this.mouseRDown){
			this.mouseDragOn = true;
		}
	};
	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	
	window.addEventListener( 'keydown', bind( this,this.onKeyDown) , true );
	window.addEventListener( 'keyup', bind( this,this.onKeyUp) , true );
	var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel"
	this.domElement.addEventListener( mousewheelevt, bind( this, this.mousewheel ), false );
	this.domElement.addEventListener( 'mousewheel', bind( this, this.mousewheel ), false );
	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );

}
