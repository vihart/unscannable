
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


		var handControl = controls.controllers[j]
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

		if (handControl.pose && handControl.buttons[1].pressed) { //grab stuff
			for (var i = 0; i < grabbables.length; i++){
				if (grabbables[i].position.distanceTo(handControl.position) < grabRadius[i]){
					grabbables[i].position.set(handControl.pose.position[0],handControl.pose.position[1],handControl.pose.position[2]);
					grabbables[i].quaternion.set(handControl.pose.orientation[0],handControl.pose.orientation[1],handControl.pose.orientation[2],handControl.pose.orientation[3]);
				}
			}
		}

		if(debug) {
			console.timeEnd("controls");
			console.log(handControl.pose.position);
		}
	}
}	