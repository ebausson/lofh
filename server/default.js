module.exports.defaultScene=function() {return{
		"objects":{
			"cube1" : {
				"geometry" : "cube",
				"materials": [ "lambert_red" ],
				"position" : [ 0, 0, 0 ],
				"rotation" : [ 0, -0.3, 0 ],
				"scale"	   : [ 1, 1, 1 ],
				"visible"  : true
			}
		}
		,"geometries":{
			"cube": {
				"type"  : "cube",
				"width" : 5,
				"height": 10,
				"depth" : 10,
				"segmentsWidth"  : 1,
				"segmentsHeight" : 1,
				"segmentsDepth"  : 1,
				"flipped" : false,
				"sides"   : { "px": true, "nx": true, "py": true, "ny": true, "pz": true, "nz": true }
			}	
		}
		,"materials":{
			"lambert_red": {
				"type": "MeshLambertMaterial",
				"parameters": { "color": 16711680 }
			}
		}
		,"lights":
		{
			"light1": {
				"type"		 : "directional",
				"direction"	 : [0,1,1],
				"color" 	 : 16777215,
				"intensity"	 : 0.8
			},

			"light2": {
				"type"	  : "point",
				"position": [0,0,0],
				"color"   : 16777215
			}

		}
		,"defaults" :{
			"bgcolor" : [0,0,0],
			"bgalpha" : 1,
			"camera"  : "cam1",
			"fog"	  : "black"
		}
	}}
module.exports.defaultSceneTest