// Setup three.js WebGL renderer
var renderer = new THREE.WebGLRenderer( { antialias: true } );

// Append the canvas element created by the renderer to document body element.
renderer.domElement.style.transform = "scaleX(-1)";
document.body.appendChild( renderer.domElement );

//Create a three.js scene
var scene = new THREE.Scene();

//Create a three.js camera
var camera = new THREE.PerspectiveCamera( 110, window.innerWidth / window.innerHeight, 0.002, 10000 );
scene.add(camera);

//Apply AR headset positional data to camera.
var controls = new THREE.ARControls( camera );

//Apply AR stereo rendering to renderer
var effect = new THREE.AREffect( renderer );
effect.setSize( window.innerWidth, window.innerHeight );

/*
Create, position, and add 3d objects
*/

//Unscannable Objects Time:

var everything = new THREE.Object3D; 

//loaders:
var onProgress = function ( xhr ) {
  if ( xhr.lengthComputable ) {
    var percentComplete = xhr.loaded / xhr.total * 100;
    console.log( Math.round(percentComplete, 2) + '% downloaded' );
  }
};

var onError = function ( xhr ) {
};


var objmtlLoader = new THREE.OBJMTLLoader();

//Load sculptures:
var littlerPink = new THREE.Object3D();
objmtlLoader.load( 'objs/littlerpink2/littlierpink.obj', 'objs/littlerpink2/littlier_pink.mtl', function ( object ) {
  object.position.set(-4,0,-2);
  object.scale.set(0.01,0.01,0.01);
  littlerPink = object;
  everything.add( littlerPink );
}, onProgress, onError );


var fish = new THREE.Object3D();
    objmtlLoader.load( 'objs/fish2/fish.obj', 'objs/fish2/fish.mtl', function ( object ) {
      object.position.set(6, 2, -8);
      object.scale.set(0.02,0.02,0.02);
      fish = object;
      everything.add( fish );
    }, onProgress, onError );

var biggerPink = new THREE.Object3D();
    objmtlLoader.load( 'objs/biggerpink/biggerpink.obj', 'objs/biggerpink/bigger_pink.mtl', function ( object ) {
      object.position.set(-3,7,-2);
      object.scale.set(20,20,20);
      biggerPink = object;
      everything.add( biggerPink );
    }, onProgress, onError );


//Lights so we can see them:
var light = new THREE.AmbientLight( 0x404040 );
everything.add( light );

var directionalLight = new THREE.DirectionalLight( 0x404040, 5 );
directionalLight.position.set( 0, 2, 0 );
everything.add( directionalLight );

var light2 = new THREE.PointLight( 0xffffff, 1, 100 );
light2.intensity = 1;
everything.add( light2 );


//add everything to the scene:
scene.add(everything);

var t = 1;

/*
Request animation frame loop function
*/
function animate() {

  t++;

  littlerPink.rotation.y = 3*Math.sin(t/100);
  littlerPink.position.set(
    -4 + 3*Math.cos(t/30),
    Math.cos(t/50)/2,
    -5 + 2*Math.cos(t/47)
    );

  fish.position.set(
    6 + Math.cos(t/500),
    2 + Math.cos(t/80)/2,
    -8 + Math.cos(t/200)/3
    );
  fish.rotation.y = Math.sin(t/120)/4;

  biggerPink.rotation.y = t/100;

  //Update AR headset position and apply to camera.
  controls.update();

  // Render the scene through the AREffect.
  effect.render( scene, camera );
  requestAnimationFrame( animate );
}

animate();	// Kick off animation loop

/*
Listen for click event
*/
document.body.addEventListener( 'click', doClickStuff);

function doClickStuff(event) {
  effect.setFullScreen(true);

  if (typeof window.screen.orientation !== 'undefined' && typeof window.screen.orientation.lock === 'function') {
    window.screen.orientation.lock('landscape-primary');
  }
}

/*
Listen for keyboard events
*/
function onkey(event) {
  event.preventDefault();

  if (event.keyCode == 90) { // z
    controls.resetSensor(); //zero rotation
  } else if (event.keyCode == 70 || event.keyCode == 13) { //f or enter
    effect.setFullScreen(true) //fullscreen
  }
};
window.addEventListener("keydown", onkey, true);

/*
Handle window resizes
*/
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  effect.setSize( window.innerWidth, window.innerHeight );
}
window.addEventListener( 'resize', onWindowResize, false );
