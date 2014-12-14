function sequence(targetDomElement, keyPressFn, logToConsole) {
	var map = [];
	var mapTime = [];
	var bufferLevel = 0;
	var bufferAction = "";
	var afterAct = false;

	function clearmap() {
		for (var mapi = 0; mapi < 255; mapi++) {
			map[mapi] = false;
			mapTime[mapi] = new Date();
		}
	}

	function compareByTime(a, b) {
		if (a.time < b.time) {
			return -1;
		}
		if (a.time > b.time) {
			return 1;
		}
		return 0;
	}

	var codes = [65, 83, 68, 70, 32, 16]; //W, A, S, D, Space,shift
	var keytree = [
		{
			single : 'e',
			sequent : [null, 'n', 's', 'h', 'r', '(']
		}, {
			single : 't',
			sequent : ['d', null, 'l', 'c', 'u', ')']
		}, {
			single : 'a',
			sequent : ['m', 'w', null, 'f', 'g', '?']
		}, {
			single : 'o',
			sequent : ['y', 'p', 'b', null, 'v', ',']
		}, {
			single : 'i',
			sequent : ['k', 'j', 'x', 'z', null, '.']
		}, {
			single : ' ',
			sequent : [
				{
					single : 'E',
					sequent : [null, 'N', 'S', 'H', 'R', null]
				}, {
					single : 'T',
					sequent : ['D', null, 'L', 'C', 'U', null]
				}, {
					single : 'A',
					sequent : ['M', 'W', null, 'F', 'G', null]
				}, {
					single : 'O',
					sequent : ['Y', 'P', 'B', null, 'V', null]
				}, {
					single : 'I',
					sequent : ['K', 'J', 'X', 'Z', null, null]
				}
			]
		}
	];

	function processInput() {

		var keydex = [];
		var keydexi = 0;
		var maxHandledKeys = 6;

		for (var i = 0; i < maxHandledKeys; i++) {
			keydex[i] = {};
		}

		for (var mapi = 0; mapi < 255; mapi++) {
			if (map[mapi]) {
				keydex[keydexi++] = {
					keycode : mapi,
					time : mapTime[mapi]
				};
			}
		}
		keydex.sort(compareByTime);
		var seq = [];
		var seqi = 0;
		for (i = 0; i < keydex.length; i++) {
			var index = codes.indexOf(keydex[i].keycode);
			if (index != -1) {
				seq[seqi++] = index;
			}

		}
		if (bufferLevel <= seq.length) {
			bufferLevel = seq.length;
			switch (seq.length) {
				case 0:
					break;
				case 1:
					bufferAction = keytree[seq[0]].single;
					break;
				case 2:
					if (typeof keytree[seq[0]].sequent[seq[1]] === 'string') {
						bufferAction = keytree[seq[0]].sequent[seq[1]];
					} else {
						bufferAction = keytree[seq[0]].sequent[seq[1]].single;
					}
					break;
				case 3:
					if(typeof keytree[seq[0]].sequent[seq[1]].sequent === 'undefined'){
						if(logToConsole)console.warn("No action for this branch / key combination");
						break;
					}
					if (typeof keytree[seq[0]].sequent[seq[1]].sequent[seq[2]] === 'string') {
						bufferAction = keytree[seq[0]].sequent[seq[1]].sequent[seq[2]];
					} else {
						bufferAction = keytree[seq[0]].sequent[seq[1]].sequent[seq[2]].single;
					}
					break;
				default:
					if(logToConsole)console.warn("this case is not handled");
					break;
			}
		}

	}

	function countActiveKeys() {
		var counter = 0;
		for (var i = 0; i < map.length; i++) {
			if (map[i]) {
				counter++;
			}
		}
		return counter;
	}

	clearmap();

	function keyDown(e) {
		afterAct = false;
		map[e.keyCode] = true;
		mapTime[e.keyCode] = new Date();
	}

	function keyUp(e) {
		processInput();
		map[e.keyCode] = false;

		var held = countActiveKeys();

		if (held === 0 && !afterAct && bufferAction) {
			keyPressFn(bufferAction);
			if (logToConsole) {
				console.log("ACTION: ", bufferAction);
			}
			afterAct = true;
		}

		if (held === 0) {
			bufferAction = null;
			bufferLevel = 0;
		}
	}

	targetDomElement.addEventListener('blur', clearmap);
	window.addEventListener('blur', clearmap);
	targetDomElement.addEventListener('keydown', keyDown);
	targetDomElement.addEventListener('keyup', keyUp);

}
