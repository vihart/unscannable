
var debug = false;

var hands = [];
var colorArray = [];

// var gravity = -0.0001;

var vrModeGamePadButtonPressed = false; // because of annoying way gamepad buttons work
var pressedController = -1;

function doGrab(){
	// HANDS!!!!
	for (j in controls.controllers) {
		if(debug) {
			console.time("controls");
		}


		var handControl = controls.controllers[j];
		if (!hands[j]) {
			//create a new hands[j] for each controller
			hands[j] = new THREE.Mesh(new THREE.OctahedronGeometry(.05), new THREE.MeshBasicMaterial({color: 0xEE0443, wireframe: true}));
			scene.add(hands[j]);
			colorArray[j] = new THREE.Color(1, 1/(2*(j+1)), 1/(2*j+1));
			hands[j].material.color.setRGB(colorArray[j].r, colorArray[j].g, colorArray[j].b);
		}
		if(handControl.pose){ //set hand vis at controller location
			hands[j].position.set(handControl.pose.position[0], handControl.pose.position[1], handControl.pose.position[2]);
			hands[j].quaternion.set(handControl.pose.orientation[0],handControl.pose.orientation[1],handControl.pose.orientation[2],handControl.pose.orientation[3]);
		}

		if (handControl.pose && handControl.buttons[3].pressed) { // enter VR mode
			pressedController = j;
			vrModeGamePadButtonPressed = true;
		} else if (vrModeGamePadButtonPressed && pressedController === j) {
			vrModeGamePadButtonPressed = false;
			pressedController = -1;
			vrMode = !vrMode;
			effect.setVRMode(vrMode);
		}

		//get vectors for things so that collision!
		if (handControl.pose){
			handPosVector.set(handControl.pose.position[0],handControl.pose.position[1],handControl.pose.position[2]);
		}
		for (var i = 0; i < grabbables.length; i++){
			if (grabbables[i]){
				relative[i] = new THREE.Vector3(everything.position.x + grabbables[i].position.x*everything.scale.x, everything.position.y + grabbables[i].position.y*everything.scale.y, everything.position.z + grabbables[i].position.z*everything.scale.z );
			}
		}

		//for grabbing and moving objects during scene setup:
		if (handControl.pose && handControl.buttons[1].pressed && editMode == true) { //grab stuff
			for (var i = grabbables.length; i > -1; i--){
				if (grabbables[i]&&(relative[i].distanceTo(handPosVector) < grabRadius[i])){
					grabbables[i].position.set((handControl.pose.position[0] - everything.position.x)/everything.scale.x, (handControl.pose.position[1] - everything.position.y)/everything.scale.y, (handControl.pose.position[2] - everything.position.z)/everything.scale.z);
					grabbables[i].quaternion.set(handControl.pose.orientation[0],handControl.pose.orientation[1],handControl.pose.orientation[2],handControl.pose.orientation[3]);
					for (var i = 0; i < light.length; i++){
						lightSphere[i].position.set(light[i].position.x, light[i].position.y, light[i].position.z); //keep our light visualizer where the light is
					}
					break;
				}
			}
		}

		//for playing and poking in gallery mode:
		if (editMode == false){
			//for poking sculptures:
			var pokeInc = 0.002;
			//collision for setting timer:
			for (var i = 0; i < grabbables.length; i++){
				if (grabbables[i]&&(relative[i].distanceTo(handPosVector) < grabRadius[i])){
					handControl.vibrate(10);
					pokeTimer[i] = pi;
				}
			}
			//animation:
			for(var i = 0; i < pokeTimer.length; i++){
				if (grabbables[i]&&(pokeTimer[i] > 0)){
					grabbables[i].position.y = originalPos[i].y + Math.sin(pokeTimer[i]);
					pokeTimer[i] -= pokeInc;
				}
			}
			//for resizing on trigger pull:
			if (handControl.pose && handControl.buttons[1].pressed) {
				var scaleInc = 0.004;
				everything.scale.set(everything.scale.x + scaleInc, everything.scale.y+scaleInc, everything.scale.y+scaleInc);
			}
		}

		if(debug) {
			console.timeEnd("controls");
			console.log(handControl.pose.position);
		}
	}
}	