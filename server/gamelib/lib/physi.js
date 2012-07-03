
THREE=require('./three.js');
	var THREE_REVISION = parseInt( THREE.REVISION, 10 ),
		_matrix = new THREE.Matrix4, _is_simulating = false,
		Physijs = {}, // object assigned to window.Physijs
		_Physijs = Physijs, // used for noConflict method
		
		Eventable, // class to provide simple event methods
		getObjectId, // returns a unique ID for a Physijs mesh object
		getEulerXYZFromQuaternion, getQuatertionFromEuler,
		addObjectChildren,
		
		_temp1, _temp2,
		_temp_vector3_1 = new THREE.Vector3,
		_quaternion_1 = new THREE.Quaternion,
		
		// constants
		MESSAGE_TYPES = {
			WORLDREPORT: 0,
			COLLISIONREPORT: 1
		},
		REPORT_ITEMSIZE = 14;
	
	exports.scripts = {};
	
	Eventable = function() {
		this._eventListeners = {};
	};
	Eventable.prototype.addEventListener = function( event_name, callback ) {
		if ( !this._eventListeners.hasOwnProperty( event_name ) ) {
			this._eventListeners[event_name] = [];
		}
		this._eventListeners[event_name].push( callback );
	};
	Eventable.prototype.removeEventListener = function( event_name, callback ) {
		var index;
		
		if ( !this._eventListeners.hasOwnProperty( event_name ) ) return false;
		
		if ( (index = this._eventListeners[event_name].indexOf( callback )) >= 0 ) {
			this._eventListeners[event_name].splice( index, 1 );
			return true;
		}
		
		return false;
	};
	Eventable.prototype.dispatchEvent = function( event_name ) {
		var i,
			parameters = Array.prototype.splice.call( arguments, 1 );
		
		if ( this._eventListeners.hasOwnProperty( event_name ) ) {
			for ( i = 0; i < this._eventListeners[event_name].length; i++ ) {
				this._eventListeners[event_name][i].apply( this, parameters );
			}
		}
	};
	Eventable.make = function( obj ) {
		obj.prototype.addEventListener = Eventable.prototype.addEventListener;
		obj.prototype.removeEventListener = Eventable.prototype.removeEventListener;
		obj.prototype.dispatchEvent = Eventable.prototype.dispatchEvent;
	};
	
	getObjectId = (function() {
		var _id = 0;
		return function() {
			return _id++;
		};
	})();
	
	getEulerXYZFromQuaternion = function ( x, y, z, w ) {
		return new THREE.Vector3(
			Math.atan2( 2 * ( x * w - y * z ), ( w * w - x * x - y * y + z * z ) ),
			Math.asin( 2 *  ( x * z + y * w ) ),
			Math.atan2( 2 * ( z * w - x * y ), ( w * w + x * x - y * y - z * z ) )
		);
	};
	
	getQuatertionFromEuler = function( x, y, z ) {
		var c1, s1, c2, s2, c3, s3, c1c2, s1s2;
		c1 = Math.cos( y  ),
		s1 = Math.sin( y  ),
		c2 = Math.cos( -z ),
		s2 = Math.sin( -z ),
		c3 = Math.cos( x  ),
		s3 = Math.sin( x  ),
		
		c1c2 = c1 * c2,
		s1s2 = s1 * s2;
		
		return {
			w: c1c2 * c3  - s1s2 * s3,
		  	x: c1c2 * s3  + s1s2 * c3,
			y: s1 * c2 * c3 + c1 * s2 * s3,
			z: c1 * s2 * c3 - s1 * c2 * s3
		};
	};
	
	
	
	// // exports.noConflict
	// exports.noConflict = function() {
		// Physijs =Physijs = _Physijs;
		// return Physijs;
	// };
	
	
	// exports.createMaterial
	exports.createMaterial = function( material, friction, restitution ) {
		var physijs_material = function(){};
		physijs_material.prototype = material;
		physijs_material = new physijs_material;
		
		physijs_material._physijs = {
			id: material.id,
			friction: friction === undefined ? .8 : friction,
			restitution: restitution === undefined ? .2 : restitution
		};
		
		return physijs_material;
	};
	
	
	// exports.Scene
	exports.Scene = function( params ) {
		var self = this;
		
		Eventable.call( this );
		THREE.Scene.call( this );
		
		this._worker = require('./physijs_worker.js' );
		this._materials = {};
		this._objects = {};
		
		this._worker.onmessage = function ( event ) {
			var _temp;
			
			if ( event.data instanceof Float32Array ) {
				// transferable object
				switch ( event.data[0] ) {
					case MESSAGE_TYPES.WORLDREPORT:
						self._updateScene( event.data );
						break;
					
					case MESSAGE_TYPES.COLLISIONREPORT:
						self._updateCollisions( event.data );
						break;
				}
				
			} else {
				
				// non-transferable object
				switch ( event.data.cmd ) {
					case 'objectReady':
						_temp = event.data.params;
						self._objects[ _temp ].dispatchEvent( 'ready' );
						break;
					
					default:
						// Do nothing, just show the message
						console.log('Received: ' , event.data);
						console.log(event.data.params);
						break;
				}
				
			}
		};
		
		
		params = params || {};
		params.ammo = exports.scripts.ammo || './ammo.js';
		this._worker.init( params );
	};
	exports.Scene.prototype = new THREE.Scene;
	exports.Scene.prototype.constructor = exports.Scene;
	Eventable.make( exports.Scene );
	
	exports.Scene.prototype._updateScene = function( data ) {
		var num_objects = data[1],
			object,
			i, offset;
			
		for ( i = 0; i < num_objects; i++ ) {
			
			offset = 2 + i * REPORT_ITEMSIZE;
			object = this._objects[ data[ offset ] ];
			
			if ( object.__dirtyPosition === false ) {
				object.position.set(
					data[ offset + 1 ],
					data[ offset + 2 ],
					data[ offset + 3 ]
				);
			}
			
			if ( object.__dirtyRotation === false ) {
				if ( object.useQuaternion ) {
					object.quaternion.set(
						data[ offset + 4 ],
						data[ offset + 5 ],
						data[ offset + 6 ],
						data[ offset + 7 ]
					);
				} else {
					object.rotation = getEulerXYZFromQuaternion(
						data[ offset + 4 ],
						data[ offset + 5 ],
						data[ offset + 6 ],
						data[ offset + 7 ]
					);
				};
			}
			
			object._physijs.linearVelocity.set(
				data[ offset + 8 ],
				data[ offset + 9 ],
				data[ offset + 10 ]
			);
			
			object._physijs.angularVelocity.set(
				data[ offset + 11 ],
				data[ offset + 12 ],
				data[ offset + 13 ]
			);
			
		}
		

			this._worker.postMessage({'data':data} );

		
		_is_simulating = false;
		this.dispatchEvent( 'update' );
	};
	
	exports.Scene.prototype._updateCollisions = function( data ) {
		/**
		 * #TODO
		 * This is probably the worst way ever to handle collisions. The inherent evilness is a residual
		 * effect from the previous version's evilness which mutated when switching to transferable objects.
		 *
		 * If you feel inclined to make this better, please do so.
		 */
		 
		var i, j, offset, object, object2,
			collisions = {}, collided_with = [];
		
		// Build collision manifest
		for ( i = 0; i < data[1]; i++ ) {
			offset = 2 + i * 2;
			object = data[ offset ];
			object2 = data[ offset + 1 ];
			
			if ( !collisions[ object ] ) collisions[ object ] = [];
			collisions[ object ].push( object2 );
		}
		
		// Deal with collisions
		for ( object in this._objects ) {
			if ( !this._objects.hasOwnProperty( object ) ) return;
			object = this._objects[ object ];
			
			if ( collisions[ object._physijs.id ] ) {
				
				// this object is touching others
				collided_with.length = 0;
				
				for ( j = 0; j < collisions[ object._physijs.id ].length; j++ ) {
					object2 = this._objects[ collisions[ object._physijs.id ][j] ];
					
					if ( object._physijs.touches.indexOf( object2._physijs.id ) === -1 ) {
						object._physijs.touches.push( object2._physijs.id );
						
						_temp_vector3_1.sub( object.getLinearVelocity(), object2.getLinearVelocity() );
						_temp1 = _temp_vector3_1.clone();
						
						_temp_vector3_1.sub( object.getAngularVelocity(), object2.getAngularVelocity() );
						_temp2 = _temp_vector3_1;
						
						object.dispatchEvent( 'collision', object2, _temp1, _temp2 );
						object2.dispatchEvent( 'collision', object, _temp1, _temp2 );
					}
					
					collided_with.push( object2._physijs.id );
				}
				for ( j = 0; j < object._physijs.touches.length; j++ ) {
					if ( collided_with.indexOf( object._physijs.touches[j] ) === -1 ) {
						object._physijs.touches.splice( j--, 1 );
					}
				}
				
			} else {
				
				// not touching other objects
				object._physijs.touches.length = 0;
				
			}
			
		}
		
			this._worker.postMessage({'data': data} );
	};
	
	// exports.Scene.prototype.execute = function( cmd, params ) {
		// this._worker.postMessage({'data':{ cmd: cmd, params: params }});
	// };
	
	addObjectChildren = function( parent, object ) {
		var i;
		
		for ( i = 0; i < object.children.length; i++ ) {
			if ( object.children[i]._physijs ) {
				object.children[i].updateMatrix();
				object.children[i].updateMatrixWorld();
				
				_temp_vector3_1.getPositionFromMatrix( object.children[i].matrixWorld );
				_quaternion_1.setFromRotationMatrix( object.children[i].matrixWorld );
				
				object.children[i]._physijs.position_offset = {
					x: _temp_vector3_1.x,
					y: _temp_vector3_1.y,
					z: _temp_vector3_1.z
				};
				
				object.children[i]._physijs.rotation = {
					x: _quaternion_1.x,
					y: _quaternion_1.y,
					z: _quaternion_1.z,
					w: _quaternion_1.w
				};
				
				parent._physijs.children.push( object.children[i]._physijs );
			}
			
			addObjectChildren( parent, object.children[i] );
		}
	};
	
	exports.Scene.prototype.add = function( object ) {
		THREE.Mesh.prototype.add.call( this, object );
		
		if ( object._physijs ) {
			object.__dirtyPosition = false;
			object.__dirtyRotation = false;
			this._objects[object._physijs.id] = object;
			
			if ( object.children.length ) {
				object._physijs.children = [];
				addObjectChildren( object, object );
			}
			
			object.world = this;
			
			if ( object.material._physijs ) {
				if ( !this._materials.hasOwnProperty( object.material._physijs.id ) ) {
					this._worker.registerMaterial( object.material._physijs );
					object._physijs.materialId = object.material._physijs.id;
				}
			}
			
			// Object starting position + rotation		
			object._physijs.position = { x: object.position.x, y: object.position.y, z: object.position.z };	
			if (!object.useQuaternion) {
				_matrix.identity().setRotationFromEuler( object.rotation );
				object.quaternion.setFromRotationMatrix( _matrix );
			};
			object._physijs.rotation = { x: object.quaternion.x, y: object.quaternion.y, z: object.quaternion.z, w: object.quaternion.w };
			
			this._worker.addObject( object._physijs );
		}
	};
	
	exports.Scene.prototype.remove = function( object ) {
		THREE.Mesh.prototype.remove.call( this, object );
		
		if ( object._physijs ) {
			this._worker.removeObject({ id: object._physijs.id } );
		}
	};
	
	exports.Scene.prototype.setGravity = function( gravity ) {
		if ( gravity ) {
			this._worker.setGravity( gravity );
		}
	};
	
	exports.Scene.prototype.simulate = function( timeStep, maxSubSteps ) {
		var object_id, object, update;
		
		if ( _is_simulating ) {
			return false;
		}
		
		_is_simulating = true;
		
		for ( object_id in this._objects ) {
			if ( !this._objects.hasOwnProperty( object_id ) ) continue;
			
			object = this._objects[object_id];
			
			if ( object.__dirtyPosition || object.__dirtyRotation ) {
				update = { id: object._physijs.id };
				
				if ( object.__dirtyPosition ) {
					update.pos = { x: object.position.x, y: object.position.y, z: object.position.z };
					object.__dirtyPosition = false;
				}
				
				if ( object.__dirtyRotation ) {
					if (!object.useQuaternion) {
						_matrix.identity().setRotationFromEuler( object.rotation );
						object.quaternion.setFromRotationMatrix( _matrix );
					};
					update.quat = { x: object.quaternion.x, y: object.quaternion.y, z: object.quaternion.z, w: object.quaternion.w };
					object.__dirtyRotation = false;
				}
				
				this._worker.updateTransform( update );
			};
		}
		
		this._worker.simulate({ timeStep: timeStep, maxSubSteps: maxSubSteps } );
		
		return true;
	};
	
	
	// Phsijs.Mesh
	exports.Mesh = function ( geometry, material, mass ) {
		var index;
		
		if ( !geometry ) {
			return;
		}
		
		Eventable.call( this );
		THREE.Mesh.call( this, geometry, material );
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		this._physijs = {
			type: null,
			id: getObjectId(),
			mass: mass || 0,
			touches: [],
			linearVelocity: new THREE.Vector3,
			angularVelocity: new THREE.Vector3
		};
	};
	exports.Mesh.prototype = new THREE.Mesh;
	exports.Mesh.prototype.constructor = exports.Mesh;
	Eventable.make( exports.Mesh );
	
	// exports.Mesh.mass
	exports.Mesh.prototype.__defineGetter__('mass', function() {
		return this._physijs.mass;
	});
	exports.Mesh.prototype.__defineSetter__('mass', function( mass ) {
		this._physijs.mass = mass;
		if ( this.world ) {
			this.world._worker.updateMass( { id: this._physijs.id, mass: mass } );
		}
	});
	
	// exports.Mesh.applyCentralImpulse
	exports.Mesh.prototype.applyCentralImpulse = function ( force ) {
		if ( this.world ) {
			this.world._worker.applyCentralImpulse( { id: this._physijs.id, x: force.x, y: force.y, z: force.z } );
		}
	};
	
	// exports.Mesh.applyImpulse
	exports.Mesh.prototype.applyImpulse = function ( force, offset ) {
		if ( this.world ) {
			this.world._worker.applyImpulse( { id: this._physijs.id, impulse_x: force.x, impulse_y: force.y, impulse_z: force.z, x: offset.x, y: offset.y, z: offset.z } );
		}
	};
	
	// exports.Mesh.applyCentralForce
	exports.Mesh.prototype.applyCentralForce = function ( force ) {
		if ( this.world ) {
			this.world._worker.applyCentralForce( { id: this._physijs.id, x: force.x, y: force.y, z: force.z } );
		}
	};
	
	// exports.Mesh.applyForce
	exports.Mesh.prototype.applyForce = function ( force, offset ) {
		if ( this.world ) {
			this.world._worker.applyForce( { id: this._physijs.id, impulse_x: force.x, impulse_y: force.y, impulse_z: force.z, x: offset.x, y: offset.y, z: offset.z } );
		}
	};
	
	// exports.Mesh.getAngularVelocity
	exports.Mesh.prototype.getAngularVelocity = function () {
		return this._physijs.angularVelocity;
	};
	
	// exports.Mesh.setAngularVelocity
	exports.Mesh.prototype.setAngularVelocity = function ( velocity ) {
		if ( this.world ) {
			this.world._worker.setAngularVelocity( { id: this._physijs.id, x: velocity.x, y: velocity.y, z: velocity.z } );
		}
	};
	
	// exports.Mesh.getLinearVelocity
	exports.Mesh.prototype.getLinearVelocity = function () {
		return this._physijs.linearVelocity;
	};
	
	// exports.Mesh.setLinearVelocity
	exports.Mesh.prototype.setLinearVelocity = function ( velocity ) {
		if ( this.world ) {
			this.world._worker.setLinearVelocity( { id: this._physijs.id, x: velocity.x, y: velocity.y, z: velocity.z } );
		}
	};
	
	// exports.Mesh.setAngularFactor
	exports.Mesh.prototype.setAngularFactor = function ( factor ) {
		if ( this.world ) {
			this.world._worker.setAngularFactor( { id: this._physijs.id, x: factor.x, y: factor.y, z: factor.z } );
		}
	};
	
	// exports.Mesh.setLinearFactor
	exports.Mesh.prototype.setLinearFactor = function ( factor ) {
		if ( this.world ) {
			this.world._worker.setLinearFactor( { id: this._physijs.id, x: factor.x, y: factor.y, z: factor.z } );
		}
	};
	
	// exports.Mesh.setDamping
	exports.Mesh.prototype.setDamping = function ( linear, angular ) {
		if ( this.world ) {
			this.world._worker.setDamping( { id: this._physijs.id, linear: linear, angular: angular } );
		}
	};
	
	// exports.Mesh.setCcdMotionThreshold
	exports.Mesh.prototype.setCcdMotionThreshold = function ( threshold ) {
		if ( this.world ) {
			this.world._worker.setCcdMotionThreshold( { id: this._physijs.id, threshold: threshold } );
		}
	};
	
	// exports.Mesh.setCcdSweptSphereRadius
	exports.Mesh.prototype.setCcdSweptSphereRadius = function ( radius ) {
		if ( this.world ) {
			this.world._worker.setCcdSweptSphereRadius( { id: this._physijs.id, radius: radius } );
		}
	};
	
	
	// exports.PlaneMesh
	exports.PlaneMesh = function ( geometry, material, mass ) {
		var width, height;
		
		exports.Mesh.call( this, geometry, material, mass );
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
		height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
		
		this._physijs.type = 'plane';
		this._physijs.normal = geometry.faces[0].normal.clone();
		this._physijs.mass = (typeof mass === 'undefined') ? width * height : mass;
	};
	exports.PlaneMesh.prototype = new exports.Mesh;
	exports.PlaneMesh.prototype.constructor = exports.PlaneMesh;
	
	
	// exports.BoxMesh
	exports.BoxMesh = function( geometry, material, mass ) {
		var width, height, depth;
		
		exports.Mesh.call( this, geometry, material, mass );
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
		height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
		depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
		
		this._physijs.type = 'box';
		this._physijs.width = width;
		this._physijs.height = height;
		this._physijs.depth = depth;
		this._physijs.mass = (typeof mass === 'undefined') ? width * height * depth : mass;
	};
	exports.BoxMesh.prototype = new exports.Mesh;
	exports.BoxMesh.prototype.constructor = exports.BoxMesh;
	
	
	// exports.SphereMesh
	exports.SphereMesh = function( geometry, material, mass ) {
		exports.Mesh.call( this, geometry, material, mass );
		
		if ( !geometry.boundingSphere ) {
			geometry.computeBoundingSphere();
		}
		
		this._physijs.type = 'sphere';
		this._physijs.radius = geometry.boundingSphere.radius;
		this._physijs.mass = (typeof mass === 'undefined') ? (4/3) * Math.PI * Math.pow(this._physijs.radius, 3) : mass;
	};
	exports.SphereMesh.prototype = new exports.Mesh;
	exports.SphereMesh.prototype.constructor = exports.SphereMesh;
	
	
	// exports.CylinderMesh
	exports.CylinderMesh = function( geometry, material, mass ) {
		var width, height, depth;
		
		exports.Mesh.call( this, geometry, material, mass );
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
		height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
		depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
		
		this._physijs.type = 'cylinder';
		this._physijs.width = width;
		this._physijs.height = height;
		this._physijs.depth = depth;
		this._physijs.mass = (typeof mass === 'undefined') ? width * height * depth : mass;
	};
	exports.CylinderMesh.prototype = new exports.Mesh;
	exports.CylinderMesh.prototype.constructor = exports.CylinderMesh;
	
	
	// exports.ConeMesh
	exports.ConeMesh = function( geometry, material, mass ) {
		var width, height, depth;
		
		exports.Mesh.call( this, geometry, material, mass );
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
		height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
		
		this._physijs.type = 'cone';
		this._physijs.radius = width / 2;
		this._physijs.height = height;
		this._physijs.mass = (typeof mass === 'undefined') ? width * height : mass;
	};
	exports.ConeMesh.prototype = new exports.Mesh;
	exports.ConeMesh.prototype.constructor = exports.ConeMesh;
	
	
	// exports.ConvexMesh
	exports.ConvexMesh = function( geometry, material, mass ) {
		var i,
			width, height, depth,
			points = [];
		
		exports.Mesh.call( this, geometry, material, mass );
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		for ( i = 0; i < geometry.vertices.length; i++ ) {
			if ( THREE_REVISION >= 49 ) {
				points.push({
					x: geometry.vertices[i].x,
					y: geometry.vertices[i].y,
					z: geometry.vertices[i].z
				});
			} else {
				points.push({
					x: geometry.vertices[i].position.x,
					y: geometry.vertices[i].position.y,
					z: geometry.vertices[i].position.z
				});

			}
		}
		
		
		width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
		height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
		depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
		
		this._physijs.type = 'convex';
		this._physijs.points = points;
		this._physijs.mass = (typeof mass === 'undefined') ? width * height * depth : mass;
	};
	exports.ConvexMesh.prototype = new exports.Mesh;
	exports.ConvexMesh.prototype.constructor = exports.ConvexMesh;
