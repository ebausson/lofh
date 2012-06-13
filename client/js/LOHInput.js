
Input=function(domElement)
{
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.mouseX = 0;
	this.mouseY = 0;
	
	this.downX = 0;
	this.downY = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.freeze = false;
	this.zoomCamera=0;
	this.mouseDragOn = false;
	
	this.mousewheel = function ( event ) {
		event.preventDefault();
		event.stopPropagation();
		if (event.wheelDelta>0) {
			this.zoomCamera=-1;
		}else
			this.zoomCamera=1;
	}
	
	this.onMouseDown = function ( event ) {
		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		switch ( event.button ) {

			case 0:
				
				break;
			case 2: 
				this.downX=this.mouseX;
				this.mouseDragOn = true;
				break;
		}
	};

	this.onMouseUp = function ( event ) {
		event.preventDefault();
		event.stopPropagation();

		switch ( event.button ) {

			case 0: 
				
				break;
			case 2: 
				this.downX=0;
				break;
		}
		this.mouseDragOn = false;
	};
	
	this.onMouseMove = function ( event ) {

		if ( this.domElement === document ) {

			this.mouseX = event.pageX;
			this.mouseY = event.pageY;

		} else {

			this.mouseX = event.pageX - this.domElement.offsetLeft ;
			this.mouseY = event.pageY - this.domElement.offsetTop;

		}
	};

	this.onKeyDown = function ( event ) {
		switch( event.keyCode ) {
			
			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

			case 82: /*R*/ this.moveUp = true; break;
			case 70: /*F*/ this.moveDown = true; break;

			case 81: /*Q*/ this.freeze = !this.freeze; break;

		}
	};

	this.onKeyUp = function ( event ) {
		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

			case 82: /*R*/ this.moveUp = false; break;
			case 70: /*F*/ this.moveDown = false; break;

		}

	};

	


	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	
	
	this.domElement.addEventListener( 'mousewheel', bind( this, this.mousewheel ), false );
	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	window.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	window.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

};