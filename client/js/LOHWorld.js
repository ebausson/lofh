LOH.World=function(scene)
{
	this.scene=scene;
	var entities=new Array();//liste des modeles actuellement en memoire.
	var shapes=new Array();
	this.target;
	
	this.initMonde=function()
	{
		var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
		scene.add( ambientLight );

		var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
		directionalLight.position.x = Math.random() - 0.5;
		directionalLight.position.y = Math.random() - 0.5;
		directionalLight.position.z = Math.random() - 0.5;
		directionalLight.position.normalize();
		scene.add( directionalLight );
		this.initShapes();
		this.addEntity("ground",2);
	}
	
	this.setTarget=function(id){
		this.target=id;
	}
	
	this.getEntity=function(id){
		if(id=="target"){
			if(typeof(this.target)!='undefined')
			{
				return scene.getChildByName(this.target,false);
			}else{
				return 0;
			}
		}else{
			return scene.getChildByName(id,false);
		}
	}
	
	this.sync=function(data){
		for(ent in data){
			if(!scene.getChildByName(data[ent].id,false)){
				this.addEntity(data[ent].id,1);
			}
			var tmp=scene.getChildByName(data[ent].id,false);
			tmp.position=data[ent].position;
		}
	}
	
	this.initShapes=function()
	{
		shapes[1]=new THREE.CubeGeometry( 10, 10, 10);
		shapes[2]=new THREE.PlaneGeometry( 1000, 1000, 100, 100);
	}
	
	this.addEntity=function(name,shapeID,position)
	{
		mesh = new THREE.Mesh( getShape(shapeID) );
		mesh.name=name;
		entities[name]=mesh;
		scene.add(mesh);
	}

	var getShape=function(shapeID)
	{
		if(shapes[shapeID])
		{
			return shapes[shapeID];
		}
		else
		{
			return shapes[1];
		}
	}
}

