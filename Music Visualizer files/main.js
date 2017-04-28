/**
* Audio Reactive Waveform via Web Audio API.
*
*/


var mouseX = 0, mouseY = 0, windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2, camera, scene, renderer, material, container;
var source;
var analyser;
var buffer;
var current = 0;
var audioBuffer;
var dropArea;
var audioContext;
var source;
//var processor;
var analyser;
var xhr;
var started = false;
var droppedFiles;

$(document).ready(function() {

	//Chrome is only browser to currently support Web Audio API
	var is_webgl = ( function () { 
		try { 
			return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); 
		} 
		catch( e ) { 
			return false; 
		} 
	} )();

	if(!is_webgl){
		$('#loading').html('Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a>.<br />' +
		'Find out how to get it <a href="http://get.webgl.org/">here</a>, or try restarting your browser.');
	}
	else {
		$('#loading').html('drop mp3 here');
		init();
	}

});

function init() {

	//init 3D scene
	container = document.createElement('div');
	document.body.appendChild(container);
	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000000);
	camera.position.z =350;
	scene = new THREE.Scene();
	scene.add(camera);
	renderer = new THREE.WebGLRenderer({
		antialias : false,
		sortObjects : false
	});
	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);

	// stop the user getting a text cursor
	document.onselectStart = function() {
		return false;
	};


	//add stats
	// stats = new Stats();
	// stats.domElement.style.position = 'absolute';
	// stats.domElement.style.top = '0px';
	// container.appendChild(stats.domElement);

	//init listeners
	// $("#loadSample").click( loadSampleAudio);  // if load audio is clicked
	// $(document).mousemove(onDocumentMouseMove);  //  controls if whether the mouse is moved.
	$(window).resize(onWindowResize);
	document.addEventListener('drop', onDocumentDrop, false);
	document.addEventListener('dragover', onDocumentDragOver, false);

	onWindowResize(null);
	audioContext = new window.AudioContext();

	
}

// function loadSampleAudio() {
// 	$('#loading').text("loading...");
// 	console.log("we are loading a song file for you");

// 	source = audioContext.createBufferSource();
// 	analyser = audioContext.createAnalyser();
// 	analyser.fftSize = 1024;
// 	analyser.smoothingTimeConstant = 0.1;

// 	// Connect audio processing graph
// 	source.connect(analyser);
// 	analyser.connect(audioContext.destination);

// 	loadAudioBuffer("audio/EMDCR.mp3");
// }

// function loadAudioBuffer(url) {

// 	// Load asynchronously
// 	var request = new XMLHttpRequest();
// 	request.open("GET", url, true);
// 	request.responseType = "arraybuffer";

// 	request.onload = function() {


// 		audioContext.decodeAudioData(request.response, function(buffer) {
// 			audioBuffer = buffer;
// 			finishLoad();
// 		}, function(e) {
// 			console.log(e);
// 		});


// 	};
// 	request.send();
// }

// function finishLoad() {
// 	source.buffer = audioBuffer;
// 	console.log(source.buffer);
// 	source.loop = true;
// 	source.start(0.0);
// 	startViz();
// }

//  if the mouse is moved
function onDocumentMouseMove(event) {
	mouseX = (event.clientX - windowHalfX)*10;
	mouseY = (event.clientY - windowHalfY)*10;
}

// when changing the size of the window
function onWindowResize(event) {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

//  this will create the animation frame from 3rd parties
function animate() {
	requestAnimationFrame(animate);
	render();
	//stats.update();
}

function render() {
	LoopVisualizer.update();

	//mouse tilt
	var xrot = mouseX/window.innerWidth * Math.PI + Math.PI;
	var yrot = mouseY/window.innerHeight* Math.PI + Math.PI;
	LoopVisualizer.loopHolder.rotation.x += (-yrot - LoopVisualizer.loopHolder.rotation.x) * 0.3;
	LoopVisualizer.loopHolder.rotation.y += (xrot - LoopVisualizer.loopHolder.rotation.y) * 0.3;

	renderer.render(scene, camera);
}

//  zooming in and out with mouse wheel
$(window).mousewheel(function(event, delta) {
	//set camera Z
	camera.position.z -= delta * 50;
});

//  when dragging audio over the window
function onDocumentDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	return false;
}

//  dropping music while playing music
function onDocumentDrop(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	console.log("drop event: " + evt);

	//clean up previous mp3
	if (source) 
		source.disconnect();  //  disconnects from the current song
	LoopVisualizer.remove();

	$('#loading').show();
	$('#loading').text("loading...");

	droppedFiles = evt.dataTransfer.files;

	console.log("dropped file " + droppedFiles[0].webkitRelativePath);  // this will tell the console the name of the file
	$('#frameTitle').text(droppedFiles[0].name);
	
		var reader = new FileReader();

	//  manipulate this for playlist
		reader.onload = function(fileEvent) {
			console.log("fileEvent: " + fileEvent);
			var data = fileEvent.target.result;
			console.log("here is data "+ fileEvent.target.result);
			// console.log("data len: " + data.prototype.byteLength);
			initAudio(data);
		};

	//  for loop originally starts here
		reader.readAsArrayBuffer(droppedFiles[0]);       //  attempt to create a playlist
	
	// reader.readAsArrayBuffer(droppedFiles[0]);  // will only read the first file

}

function initAudio(data) {
	source = audioContext.createBufferSource();
	console.log("duration: " + source.duration);
	//  will attempt to decode an audio file based on the extension
	//  suggest you stick with MP3
	if(audioContext.decodeAudioData) {
		audioContext.decodeAudioData(data, function(buffer) {
			source.buffer = buffer;
			createAudio();
		}, 
		//  in case unable to decode audio file
		function(err) {
			console.log(err);
			$('#loading').text("cannot decode mp3");
		});
	} else {
		source.buffer = audioContext.createBuffer(data, false );
		createAudio();
	}
}

//  if the space bar is pressed
var space = false;
var startOffset = 0;
var startTime = 0;
$(function() {
  $(document).keydown(function(evt) {
  	if (evt.keyCode == 32 && space) {  // pressing space to resume
	    space = false;
	    // startTime = audioContext.currentTime;
	    // source = audioContext.createBufferSource();
	    // // source.buffer = audioContext.createBuffer(data, false );
	    // source.connect(audioContext.destination);
	    // source.start(0, startOffset % source.buffer);

	    //  try creating resume audio which is the same as create, but start is modded?
	    createAudio();
    }
    if (evt.keyCode == 32 && !space) {  // pressing space to pause
      space = true;
      source.disconnect(); // should stop the music at the current time
      // source.stop();
  	  // Measure how much time passed since the last pause.
  	  startOffset += audioContext.currentTime - startTime;

      console.log('curr time stopped  at: ' + audioContext.currentTime);
    }
    if (evt.keyCode == 39){
    	nextSong();
    }
    
  });
});

function nextSong(){
	current ++;
		source.disconnect();  // get rid of old nodes
		LoopVisualizer.remove();
		//  if we are at the end of the list
		if(current >= droppedFiles.length){   //  greater than or equal to because of people who think it is funny to spam the right arrow button
			current = 0;
			var reader = new FileReader();
			$('#frameTitle').text(droppedFiles[current].name);
		//  manipulate this for playlist
			reader.onload = function(fileEvent) {
				console.log("fileEvent: " + fileEvent);
				var data = fileEvent.target.result;
				console.log("here is data "+ fileEvent.target.result);
					// console.log("data len: " + data.prototype.byteLength);
				initAudio(data);
			};

			reader.readAsArrayBuffer(droppedFiles[current]);       //  attempt to create a playlist
		}
		//  if we are not
		else{
			var reader = new FileReader();
			$('#frameTitle').text(droppedFiles[current].name);
		//  manipulate this for playlist
			reader.onload = function(fileEvent) {
				console.log("fileEvent: " + fileEvent);
				var data = fileEvent.target.result;
				console.log("here is data "+ fileEvent.target.result);
					// console.log("data len: " + data.prototype.byteLength);
				initAudio(data);
			};

			reader.readAsArrayBuffer(droppedFiles[current]);       //  attempt to create a playlist
		}
}


//  pass audio to the buffers and create nodes
function createAudio() {

	analyser = audioContext.createAnalyser();
	analyser.fftSize = 1024;
	analyser.smoothingTimeConstant = 0.1;
	source.connect(audioContext.destination);
	source.connect(analyser);
	source.start(0);
	// source.loop = true;

	//  if the current song has ended, advance to the next
	source.onended = function(){
		current ++;
		// if(source) source.disconnect();  // get rid of old nodes
		LoopVisualizer.remove();
		//  if we are at the end of the list
		if(current === droppedFiles.length){
			current = 0;
			var reader = new FileReader();
			$('#frameTitle').text(droppedFiles[current].name);
		//  manipulate this for playlist
			reader.onload = function(fileEvent) {
				console.log("fileEvent: " + fileEvent);
				var data = fileEvent.target.result;
				console.log("here is data "+ fileEvent.target.result);
					// console.log("data len: " + data.prototype.byteLength);
				initAudio(data);
			};

			reader.readAsArrayBuffer(droppedFiles[current]);       //  attempt to create a playlist
		}
		//  if we are not
		else{
			var reader = new FileReader();
			$('#frameTitle').text(droppedFiles[current].name);
		//  manipulate this for playlist
			reader.onload = function(fileEvent) {
				console.log("fileEvent: " + fileEvent);
				var data = fileEvent.target.result;
				console.log("here is data "+ fileEvent.target.result);
					// console.log("data len: " + data.prototype.byteLength);
				initAudio(data);
			};

			reader.readAsArrayBuffer(droppedFiles[current]);       //  attempt to create a playlist
		}
	}

	startViz();
}

function startViz(){

	//  hide the loading
	$('#loading').hide();

	//  initialize the animations
	LoopVisualizer.init();

	//  animate the rings
	if (!started){
		started = true;
		animate();
	}

}
