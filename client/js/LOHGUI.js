
LOH.WebGLBased=function(resolution){

	this.domElement=document.createElement('div');
	this.domElement.width=resolution.width;
	this.domElement.height=resolution.height;
	
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.sortObjects = false;
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

LOH.SelectScreenGUI=function(){
	
	this.domElement=document.createElement('div');
	
	var nameDiv=document.createElement('div');
	nameDiv.style.position = 'absolute';
	nameDiv.style.top = '10px';
	nameDiv.style.right = window.innerWidth/2+'px';
	this.domElement.appendChild(nameDiv);
	
	var nameText=document.createElement('p');
	nameText.innerHTML='NAME:';
	nameDiv.appendChild(nameText);
	
	var nameField=document.createElement('input');
	nameField.value="NAME";
	nameField.type='text';
	nameField.style.top = '10px';
	nameField.style.right = '100px';
	nameDiv.appendChild(nameField);
	
	var createButton=document.createElement('input');
	createButton.type='button';
	createButton.onclick=function(){dispatch['create'](currentSlot);};
	createButton.value='CREATE';
	createButton.style.position = 'absolute';
	createButton.style.bottom = '10px';
	createButton.style.right = '10px';
	createButton.style.zIndex = 100;
	createButton.style.display="none"
	this.domElement.appendChild(createButton);
	
	
	var playButton=document.createElement('input');
	playButton.type='button';
	playButton.onclick=function(){dispatch['play'](currentSlot);};
	playButton.value='PLAY';
	playButton.style.position = 'absolute';
	playButton.style.bottom = '10px';
	playButton.style.right = '10px';
	playButton.style.zIndex = 100;
	playButton.style.display="none"
	this.domElement.appendChild(playButton);
	
	var charDiv=document.createElement('div');
	charDiv.style.position = 'absolute';
	charDiv.style.bottom = '10px';
	charDiv.style.right = window.innerWidth/2+'px';
	this.domElement.appendChild(charDiv);
	
	var character1=document.createElement('input');
	character1.type='button';
	character1.value='character1';
	character1.onclick=function(){selectSlot('slot1')};
	charDiv.appendChild(character1);
	var character2=document.createElement('input');
	character2.type='button';
	character2.value='character2';
	character2.onclick=function(){selectSlot('slot2')};
	charDiv.appendChild(character2);
	var character3=document.createElement('input');
	character3.type='button';
	character3.value='character3';
	character3.onclick=function(){selectSlot('slot3')};
	charDiv.appendChild(character3);
	slotList={};
	this.init=function(entities){
		console.log(entities)
		slotList=entities;
		selectSlot('slot1');
	}
	currentSlot=0;
	function selectSlot(num){
		if(currentSlot != num){
			if(slotList[num] != 0){
				playButton.style.display="block";
				createButton.style.display="none";				
			}else{
				playButton.style.display="none";
				createButton.style.display="block";
			}
			select=slotList[num]||num
			old=slotList[currentSlot]||currentSlot
			dispatch['Clientsync']({'func':'selectCharacter','params':{'select':select,'old':old}});
			currentSlot=num;
		}
	}
	
}
LOH.LoadingGUI=function(){
	this.domElement=document.createElement('div');
	var nameText=document.createElement('p');
	nameText.innerHTML="LOADING";
	nameText.style.position = 'absolute';
	nameText.style.bottom = window.innerHeight/2+'px';
	nameText.style.right = window.innerWidth/2+'px';
	this.domElement.appendChild(nameText);
}
LOH.GameGUI=function(){
	this.domElement=document.createElement('div');
	
}