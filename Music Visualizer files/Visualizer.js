var LoopVisualizer = (function() {

	var RINGCOUNT = 200;  //  the number of rings in total to display.  will decrease framerate with more
	var SEPARATION = 0;   //  has to do with spacing in between the rings
	var INIT_RADIUS = 10;//  inner circle radius
	var SEGMENTS = 512;
	var VOL_SENS = 3;    //  color of rings.  higher means they will be desensitized.  this means more jumping, less colors with louder parts.  range will be from 0 - 10.
	var BIN_COUNT = 1024;  //  controls the amount of the ring.  512 is the complete circle.  256 is half circle.  more goes well with increased vol sens.  however, decreases framerate

	var rings = [];
	//var geoms = [];
	var materials = [];
	var particles;
	var levels = [];
	//var waves = [];
	var colors = [];

	//  inner sphere
	var sphereGeometry;
	var sphereMaterial;
	var sphereMesh;

	//  particles
	var particleMaterial;  //  will be a three.pointcloudmaterial
	var particleGeometry;  //  will be a three.geometry
	var xcoord, ycoord, zcoord; //  random points on canvas
	var pointCloud;

	//  loopholder holds all the 3d stuff
	var loopHolder = new THREE.Object3D();
	var perlin = new ImprovedNoise();
	var noisePos = 0;
	var freqByteData;
	var timeByteData;

	var loopGeom; //  one geom for all rings


	function init() {

		rings = [];
		geoms = [];
		materials = [];
		levels = [];
		// waves = [];
		colors = [];

		////////  INIT audio in
		freqByteData = new Uint8Array(BIN_COUNT);
		timeByteData = new Uint8Array(BIN_COUNT);

		scene.add(loopHolder);

		var scale = 1;
		var alt = 0;

		//  make the circle for the rings
		var circleShape = new THREE.Shape();
		circleShape.absarc( 0, 0, INIT_RADIUS, 0, Math.PI*2, false );

		//  create a sphere in the middle
		sphereGeometry = new THREE.SphereGeometry( INIT_RADIUS, INIT_RADIUS, Math.PI*2);  // create a sphere in the middle
		sphereMaterial = new THREE.MeshBasicMaterial({
				color: 0xff0000,
				wireframe: true,
				blending: THREE.AdditiveBlending,
				transparent: true
			});
		sphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial);
		sphereMesh.geometry.dynamic = true;  // allow for auto updates
		
		//  make particle mesh
		particleGeometry = new THREE.Geometry();
		particleMaterial = new THREE.PointCloudMaterial({
			color: 0xff0000,
			wireframe: true,
			blending: THREE.AdditiveBlending,
			transparent: true
		});

		//  createPointsGeometry returns (SEGMENTS * 2 )+ 1 points
		loopGeom = circleShape.createPointsGeometry(SEGMENTS/2);  // do not edit from equalling 256
		loopGeom.dynamic = true;  // allow for auto updates

		//  create rings
		for(var i = 0; i < RINGCOUNT; i++) {

			var m = new THREE.LineBasicMaterial( { color: 0xffffff,
				linewidth: 1 ,
				opacity : 1,
				blending : THREE.AdditiveBlending,
				// depthTest : false,
				transparent : true

			});

			var line = new THREE.Line( loopGeom, m);

			rings.push(line);
			//  geoms.push(geom);
			materials.push(m);
			//  this will make the rings bigger
			scale *= 1.02;
			line.scale.x = scale;  
			line.scale.y = scale;
			// sphereMesh.scale.x = scale;
			// sphereMesh.scale.y = scale;
			// sphereMesh.scale.z = scale;
			loopHolder.add(line);
			

			levels.push(0);
			//  waves.push(emptyBinData);
			colors.push(0);

			// rings
			// if (Math.floor(i /20) % 2 == 0 ){
			// 	line.visible = false;
			// }

		}

		//  try adding the sphere mesh
		loopHolder.add(sphereMesh);


		// make me some particles
		for(var i = 0; i < 1000; i ++){
			xcoord = (Math.random() * 800) - 400;
			ycoord = (Math.random() * 800) - 400;
			zcoord = (Math.random() * 800) - 400;


			particleGeometry.vertices.push(new THREE.Vector3(xcoord, ycoord, zcoord));
		}
		
		pointCloud = new THREE.PointCloud(particleGeometry, particleMaterial);
		loopHolder.add(pointCloud);
	}


	//  remove rings from the loop
	function remove() {

		// sphereMesh.remove();

		if (loopHolder){
			loopHolder.remove(sphereMesh);
			for(var i = 0; i < RINGCOUNT; i++) {
				loopHolder.remove(rings[i]);
			}

			// for(var i = 0; i < 1000; i ++){
				loopHolder.remove(pointCloud);
			// }

		}
	}

	function update() {

		//analyser.smoothingTimeConstant = 0.1;
		analyser.getByteFrequencyData(freqByteData);
		analyser.getByteTimeDomainData(timeByteData);

		//get average level
		var sum = 0;
		for(var i = 0; i < BIN_COUNT; i++) {
			sum += freqByteData[i];
		}
		var aveLevel = sum / BIN_COUNT;
		var scaled_average = (aveLevel / 256) * VOL_SENS; //  256 is the highest a level can be
		levels.push(scaled_average);

		// read waveform into timeByteData
		// waves.push(timeByteData);

		//  get noise color posn
		noisePos += 0.005;
		var n = Math.abs(perlin.noise(noisePos, 0, 0));
		colors.push(n);

		levels.shift(1);
		// waves.shift(1);
		colors.shift(1);


		//  write current waveform into all rings
		for(var j = 0; j < SEGMENTS; j++) {
			loopGeom.vertices[j].z = (timeByteData[j] - 128); // stretch by 2
		}
		// link up last segment
		loopGeom.vertices[SEGMENTS].z = loopGeom.vertices[0].z;
		loopGeom.verticesNeedUpdate = true;
		sphereMesh.verticesNeedUpdate = true;

		//for( i = RINGCOUNT-1; i > 0 ; i--) {

		for( i = 0; i < RINGCOUNT ; i++) {

			var ringId = RINGCOUNT - i - 1;
			

			var normLevel = levels[ringId] + 0.01; //avoid scaling by 0
			var hue = colors[i];

			materials[i].color.setHSL(hue, 1, normLevel);
			sphereMaterial.color.setHSL( hue, 1 , normLevel);
			// particleMaterial.color.setHSL(hue, 0.7, normLevel - 0.02);
			materials[i].linewidth = normLevel*3;
			materials[i].opacity = normLevel; //fadeout
			rings[i].scale.z = normLevel/3;

			//  will reset the sphere to a regular size
			sphereMesh.scale.x = normLevel *3;
			sphereMesh.scale.y = normLevel*3;
			sphereMesh.scale.z = normLevel*3;
		}

		//auto tilt 
		loopHolder.rotation.x = perlin.noise(noisePos * .5, 10,0) * Math.PI*.6;  // move camera around x axis
		loopHolder.rotation.y = perlin.noise(noisePos * .5, 20, 0) * Math.PI*.6;  // move camera around y axis
		// loopHolder.rotation.z = perlin.noise(noisePos * .5, 10, 10) * Math.PI*.6;  //  move camera around z axis
		sphereMesh.rotation.x = perlin.noise(noisePos * .5, 10,0) * Math.PI*.6;
		sphereMesh.rotation.y = perlin.noise(noisePos * .5, 20, 0) * Math.PI*.6;

	}

	return {
		init:init,
		update:update,
		remove:remove,
		loopHolder:loopHolder
	};
	}());