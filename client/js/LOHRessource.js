LOH.Ressources=new function(){
	var ressources={ 
	"patterns":{}
	,"geometries":{}
	,"textures": {}
	,"materials":{}
	,"lights":{}
	,"audio":{}
	,"defaults":{}
	}
	
	var waitinQueue={}	
	
	this.getRessource=function(which,callback){
		if(which.type){
			if(ressources[which.type][which.id]){
				return ressources[which.type][which.id];
			}else{
				if(!waitinQueue[which.id]){
					waitinQueue[which.id]=new Array();
				}
				waitinQueue[which.id].push(callback);
				dispatch['ressourceQuery'](which.id);
				return ressources['defaults'][which.type];
			}
		}else{
			waitinQueue[which]=callback;
			dispatch['ressourceQuery'](which);
		}
	}
	
	this.reset=function(){
		ressources={ 
		"patterns":{}
		,"geometries":{}
		,"materials":{}
		,"lights":{}
		,"audio":{}
		,"defaults":{}
		}
	}
	
	dispatch['ressourceSync']=bind(this,function(data){
		loadRessource(data,waitinQueue[data.id]);
	});
	
	acknowledgeLoading=function(type,id,ressource){
		ressources[type][id]=ressource;
		for(n in waitinQueue[id]){
			waitinQueue[id][n](ressource);
			delete waitinQueue[id][n];
		}
	}
	
	
	
	loadRessource=function(data,callbackFinished){
		binLoader = new THREE.BinaryLoader();
		jsonLoader = new THREE.JSONLoader();
		
		scope.onLoadStart = function () {};
		scope.onLoadProgress = function() {};
		scope.onLoadComplete = function () {};

		scope.callbackSync = function () {};
		scope.callbackProgress = function () {};
		
		var counter={"geometries":0,"textures":0};
		var total={"geometries":0,"textures":0};
		
		var ress=data.ressource;
		
		var haveCallback=false;
		function create_callback(type, id ) {
			haveCallback=true;
			return function( data ) {
				acknowledgeLoading( type, id, data);
				counter[type] -= 1;
				scope.onLoadComplete();
				async_callback_gate();
			}
		};

		function async_callback_gate() {

			var progress = {

				total_geometries	: total['geometries'],
				total_textures		: total['textures'],
				loadedModels		: total['geometries'] - counter['geometries'],
				loadedTextures		: total['textures'] - counter['textures']

			};

			scope.callbackProgress( progress );

			scope.onLoadProgress();

			if( counter['geometries'] == 0 && counter['textures'] == 0 ) {
				if(typeof callbackFinished == 'function')
					callbackFinished();
			}
		};
		// patterns
		for ( dp in ress.patterns ){
			ressources.patterns[dp]=ress.patterns[dp];
		}
		// lights
		for ( dl in ress.lights ) {

			l = ress.lights[ dl ];

			hex = ( l.color !== undefined ) ? l.color : 0xffffff;
			intensity = ( l.intensity !== undefined ) ? l.intensity : 1;

			if ( l.type == "directional" ) {

				p = l.direction;

				light = new THREE.DirectionalLight( hex, intensity );
				light.position.set( p[0], p[1], p[2] );
				light.position.normalize();

			} else if ( l.type == "point" ) {

				p = l.position;
				d = l.distance;

				light = new THREE.PointLight( hex, intensity, d );
				light.position.set( p[0], p[1], p[2] );

			} else if ( l.type == "ambient" ) {

				light = new THREE.AmbientLight( hex );

			}			
			ressources.lights[dl]=light;
		}
		// fogs

		for( df in data.fogs ) {

			f = data.fogs[ df ];

			if ( f.type == "linear" ) {

				fog = new THREE.Fog( 0x000000, f.near, f.far );

			} else if ( f.type == "exp2" ) {

				fog = new THREE.FogExp2( 0x000000, f.density );

			}

			c = f.color;
			fog.color.setRGB( c[0], c[1], c[2] );

			ressources.fogs[ df ] = fog;

		}

		// geometries

		// count how many models will be loaded asynchronously
		for( dg in ress.geometries ) {
			g = ress.geometries[ dg ];
			if ( g.type == "bin_mesh" || g.type == "ascii_mesh" || g.type == "embedded_mesh" ) {
				counter['geometries'] += 1;
				scope.onLoadStart();
			}
		}

		total['geometries']= counter['geometries'];

		for ( dg in ress.geometries ) {

			g = ress.geometries[ dg ];

			if ( g.type == "cube" ) {

				geometry = new THREE.CubeGeometry( g.width, g.height, g.depth, g.segmentsWidth, g.segmentsHeight, g.segmentsDepth, null, g.flipped, g.sides );
				acknowledgeLoading('geometries',dg,geometry);

			} else if ( g.type == "plane" ) {

				geometry = new THREE.PlaneGeometry( g.width, g.height, g.segmentsWidth, g.segmentsHeight );
				acknowledgeLoading('geometries',dg,geometry);

			} else if ( g.type == "sphere" ) {

				geometry = new THREE.SphereGeometry( g.radius, g.segmentsWidth, g.segmentsHeight );
				acknowledgeLoading('geometries',dg,geometry);

			} else if ( g.type == "cylinder" ) {

				geometry = new THREE.CylinderGeometry( g.topRad, g.botRad, g.height, g.radSegs, g.heightSegs );
				acknowledgeLoading('geometries',dg,geometry);

			} else if ( g.type == "torus" ) {

				geometry = new THREE.TorusGeometry( g.radius, g.tube, g.segmentsR, g.segmentsT );
				acknowledgeLoading('geometries',dg,geometry);

			} else if ( g.type == "icosahedron" ) {

				geometry = new THREE.IcosahedronGeometry( g.radius, g.subdivisions );
				acknowledgeLoading('geometries',dg,geometry);

			} else if ( g.type == "bin_mesh" ) {

				binLoader.load( get_url( g.url, data.urlBaseType ), create_callback('geometries', dg ) );

			} else if ( g.type == "ascii_mesh" ) {

				jsonLoader.load( get_url( g.url, data.urlBaseType ), create_callback('geometries', dg ) );

			} else if ( g.type == "embedded_mesh" ) {

				var modelJson = ress.embeds[ g.id ],
					texture_path = "";

				// Pass metadata along to jsonLoader so it knows the format version.
				modelJson.metadata = ress.metadata;

				if ( modelJson ) {

					jsonLoader.createModel( modelJson, create_callback('geometries', dg ), texture_path );

				}

			}

		}

		// textures

		// count how many textures will be loaded asynchronously

		for( dt in ress.textures ) {

			tt = ress.textures[ dt ];

			if( tt.url instanceof Array ) {

				counter['textures'] += tt.url.length;

				for( var n = 0; n < tt.url.length; n ++ ) {

					scope.onLoadStart();

				}

			} else {

				counter['textures'] += 1;

				scope.onLoadStart();

			}

		}

		total['textures'] = counter['textures'];

		for( dt in ress.textures ) {

			tt = ress.textures[ dt ];

			if ( tt.mapping != undefined && THREE[ tt.mapping ] != undefined  ) {

				tt.mapping = new THREE[ tt.mapping ]();

			}

			if( tt.url instanceof Array ) {

				var url_array = [];

				for( var i = 0; i < tt.url.length; i ++ ) {

					url_array[ i ] = get_url( tt.url[ i ], data.urlBaseType );

				}

				THREE.ImageUtils.loadTextureCube( url_array, tt.mapping, create_callback('textures', dt ) );

			} else {

				texture = THREE.ImageUtils.loadTexture( get_url( tt.url, data.urlBaseType ), tt.mapping, create_callback('textures', dt ) );

				if ( THREE[ tt.minFilter ] != undefined )
					texture.minFilter = THREE[ tt.minFilter ];

				if ( THREE[ tt.magFilter ] != undefined )
					texture.magFilter = THREE[ tt.magFilter ];


				if ( tt.repeat ) {

					texture.repeat.set( tt.repeat[ 0 ], tt.repeat[ 1 ] );

					if ( tt.repeat[ 0 ] != 1 ) texture.wrapS = THREE.RepeatWrapping;
					if ( tt.repeat[ 1 ] != 1 ) texture.wrapT = THREE.RepeatWrapping;

				}

				if ( tt.offset ) {

					texture.offset.set( tt.offset[ 0 ], tt.offset[ 1 ] );

				}

				// handle wrap after repeat so that default repeat can be overriden

				if ( tt.wrap ) {

					var wrapMap = {
					"repeat" 	: THREE.RepeatWrapping,
					"mirror"	: THREE.MirroredRepeatWrapping
					}

					if ( wrapMap[ tt.wrap[ 0 ] ] !== undefined ) texture.wrapS = wrapMap[ tt.wrap[ 0 ] ];
					if ( wrapMap[ tt.wrap[ 1 ] ] !== undefined ) texture.wrapT = wrapMap[ tt.wrap[ 1 ] ];

				}

			}

		}

		// materials

		for ( dm in ress.materials ) {

			m = ress.materials[ dm ];

			for ( pp in m.parameters ) {

				if ( pp == "envMap" || pp == "map" || pp == "lightMap" ) {

					scope.getRessource({type:'textures','id': m.parameters[ pp ]},function(data){m.parameters[ pp ] =data});

				} else if ( pp == "shading" ) {

					m.parameters[ pp ] = ( m.parameters[ pp ] == "flat" ) ? THREE.FlatShading : THREE.SmoothShading;

				} else if ( pp == "blending" ) {

					m.parameters[ pp ] = THREE[ m.parameters[ pp ] ] ? THREE[ m.parameters[ pp ] ] : THREE.NormalBlending;

				} else if ( pp == "combine" ) {

					m.parameters[ pp ] = ( m.parameters[ pp ] == "MixOperation" ) ? THREE.MixOperation : THREE.MultiplyOperation;

				} else if ( pp == "vertexColors" ) {

					if ( m.parameters[ pp ] == "face" ) {

						m.parameters[ pp ] = THREE.FaceColors;

					// default to vertex colors if "vertexColors" is anything else face colors or 0 / null / false

					} else if ( m.parameters[ pp ] )   {

						m.parameters[ pp ] = THREE.VertexColors;

					}

				}

			}

			if ( m.parameters.opacity !== undefined && m.parameters.opacity < 1.0 ) {

				m.parameters.transparent = true;

			}

			if ( m.parameters.normalMap ) {

				var shader = THREE.ShaderUtils.lib[ "normal" ];
				var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

				var diffuse = m.parameters.color;
				var specular = m.parameters.specular;
				var ambient = m.parameters.ambient;
				var shininess = m.parameters.shininess;

				uniforms[ "tNormal" ].texture = result.textures[ m.parameters.normalMap ];

				if ( m.parameters.normalMapFactor ) {

					uniforms[ "uNormalScale" ].value = m.parameters.normalMapFactor;

				}

				if ( m.parameters.map ) {

					uniforms[ "tDiffuse" ].texture = m.parameters.map;
					uniforms[ "enableDiffuse" ].value = true;

				}

				if ( m.parameters.lightMap ) {

					uniforms[ "tAO" ].texture = m.parameters.lightMap;
					uniforms[ "enableAO" ].value = true;

				}

				if ( m.parameters.specularMap ) {

					uniforms[ "tSpecular" ].texture = result.textures[ m.parameters.specularMap ];
					uniforms[ "enableSpecular" ].value = true;

				}

				uniforms[ "uDiffuseColor" ].value.setHex( diffuse );
				uniforms[ "uSpecularColor" ].value.setHex( specular );
				uniforms[ "uAmbientColor" ].value.setHex( ambient );

				uniforms[ "uShininess" ].value = shininess;

				if ( m.parameters.opacity ) {

					uniforms[ "uOpacity" ].value = m.parameters.opacity;

				}

				var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, fog: true };

				material = new THREE.ShaderMaterial( parameters );

			} else {

				material = new THREE[ m.type ]( m.parameters );

			}
			acknowledgeLoading('materials',dm,material);
		}
		if(!haveCallback)
			async_callback_gate()
	}
}