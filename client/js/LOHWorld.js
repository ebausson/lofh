LOH.World=function(scene)
{
	this.scene=scene;
	var entities=new Array();//liste des modeles actuellement en memoire.
	var shapes=new Array();
	var materials=new Array();
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
		this.initMaterials();
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
			var tmp=scene.getChildByName(data[ent].id,false);
			if(!tmp){
				this.addEntity(data[ent].id,1);
				scene.getChildByName(data[ent].id,false).position=data[ent].position;
			}else{
				if((tmp.name!=this.target)||(new THREE.Vector4().sub(tmp.position,data[ent].position).length()>2)){
					tmp.position=data[ent].position;
				}
			}
		}
	}
	
	this.initShapes=function(){
		shapes[1]=new THREE.CubeGeometry( 10, 10, 10);
		shapes[2]=new THREE.PlaneGeometry( 1000, 1000, 100, 100);
	}
	this.initMaterials=function(){
		materials[1]=new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } );
		materials[2]=new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } );
	}
	this.addEntity=function(name,shapeID,position){
		mesh = new THREE.Mesh( getShape(shapeID), new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } ) );
		mesh.name=name;
		entities[name]=mesh;
		scene.add(mesh);
	}

	var getShape=function(shapeID){
		if(shapes[shapeID]){
			return shapes[shapeID];
		}else{
			return shapes[1];
		}
	}
	var getMaterial=function(materialID){
		if(materials[materialID]){
			return materials[materialID];
		}else{
			return materials[1];
		}
	}
}

