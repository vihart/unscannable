
var debug = false;

var hands = [];
var colorArray = [];

// var gravity = -0.0001;

var vrModeGamePadButtonPressed = false; // because of annoying way gamepad buttons work
var squeezing = false;
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

		//to change between edit and gallery mode:
		if (handControl.buttons[2].pressed){
			if (squeezing == false){
				editMode = !editMode;
				for (var i = 0; i< light.length; i++){
		    		lightSphere[i].visible = !lightSphere[i].visible;
		    	}
				squeezing = true;
			}
		} else {
			squeezing = false;
		}

		//edit mode for grabbing and moving objects during scene setup:
		if (handControl.pose && handControl.buttons[1].pressed && editMode == true) { //grab stuff
			for (var i = grabbables.length; i > -1; i--){
				if (grabbables[i]&&(relative[i].distanceTo(handPosVector) < grabRadius[i])){
					grabbables[i].position.set((handControl.pose.position[0] - everything.position.x)/everything.scale.x, (handControl.pose.position[1] - everything.position.y)/everything.scale.y, (handControl.pose.position[2] - everything.position.z)/everything.scale.z);
					grabbables[i].quaternion.set(handControl.pose.orientation[0],handControl.pose.orientation[1],handControl.pose.orientation[2],handControl.pose.orientation[3]);
					// grabbables[i].scale.set(handControl.axes[0], handControl.axes[1], handControl.buttons[1].value);
					if (grabbables[i].intensity){
						var lightNumber = i - (grabbables.length - light.length);
						lightSphere[lightNumber].position.set(grabbables[i].position.x, grabbables[i].position.y, grabbables[i].position.z); //keep our light visualizer where the light is
						if (handControl.buttons[0].pressed){
							grabbables[i].intensity = handControl.axes[0] + 1;
						} else if (handControl.buttons[0].touched){
							grabbables[i].color.setHSL((1 + handControl.axes[0])/2, 1, (1 + handControl.axes[1])/2);
							// grabbables[i].color.b = handControl.axes[1] + 1;
							// grabbables[i].color.r = handControl.axes[0] + 1;
							// lightSphere[lightNumber].scale.set(0.1 + grabbables[i].intensity, 0.1 + grabbables[i].intensity, 0.1 + grabbables[i].intensity);
							// grabRadius[i] = 0.1 + grabbables[i].intensity/10;	
						}
						lightSphere[lightNumber].material.color.setRGB(grabbables[i].color.r * grabbables[i].intensity, grabbables[i].color.g * grabbables[i].intensity, grabbables[i].color.b * grabbables[i].intensity);

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
				if (grabbables[i]&&(relative[i].distanceTo(handPosVector) < grabRadius[i])&&(!pokeTimer[i] || pokeTimer[i] < 3)){
					handControl.vibrate(10);
					pokeTimer[i] = pi;
					//for sound effects:
					hit[currentHit].play();
					currentHit = (currentHit + 1)%5;
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