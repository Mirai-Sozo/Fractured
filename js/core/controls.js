function loadControls() {
	window.addEventListener("keydown", function (e) {
		let key = e.key.toLowerCase();
		console.log(key);
		if (typeof controls["press" + key.toUpperCase()] == "function") controls["press" + key.toUpperCase()]();
		if (controls[key] != undefined && !Modal.showing)
			controls[key] = true;
	})

	window.addEventListener("keyup", function (e) {
		let key = e.key.toLowerCase();
		if (controls[key] != undefined) controls[key] = false;
	})

	new Updater(function () {
		let right = controls.d || controls.arrowright,
			left = controls.a || controls.arrowleft,
			up = controls.w || controls.arrowup,
			down = controls.s || controls.arrowdown;

		if (right || left || up || down) {
			controls.ticks++;

			if (right) 
				placeData.facing = 0;
			else if (left)
				placeData.facing = 2;
			else if (up)
				placeData.facing = 3;
			else if (down) 
				placeData.facing = 1;
			
			renderLayer1();
		} else {
			controls.ticks = 0;
		}

		if (controls.ticks != 1) {
			controls.ticks = controls.ticks%4;
			return;
		}

		if (controls.shift) return;

		let {x, y} = player.pos;

		if (right && checkTileAccess(x + 1, y)) {
			player.pos.x++;
			x++;
			//Needed to prevent diagonal clipping into blocks. Don't remove it again!
			render();
			updateTileUsage();
		} else if (left && checkTileAccess(x - 1, y)) {
			player.pos.x--;
			x--;
			render();
			updateTileUsage();
		}
		if (up && checkTileAccess(x, y - 1)) {
			player.pos.y--;
			render();
			updateTileUsage();
		} else if (down && checkTileAccess(x, y + 1)) {
			player.pos.y++;
			render();
			updateTileUsage();
		}
	})
}

let controls = {
	w: false,
	a: false,
	s: false,
	d: false,
	shift: false,
	pressA() {
		if (accessData.tiles.includes(2)) {
			openMenu(...getXYfromDir(2))
		}
	},
	pressW() {
		if (accessData.tiles.includes(3)) {
			openMenu(...getXYfromDir(3))
		}
	},
	pressD() {
		if (accessData.tiles.includes(0)) {
			openMenu(...getXYfromDir(0))
		}
	},
	pressS() {
		if (accessData.tiles.includes(1)) {
			openMenu(...getXYfromDir(1))
		}
	},
	"press "() {
		Building.stopPlacing();
	},
	arrowup: false,
	arrowleft: false,
	arrowdown: false,
	arrowright: false,
	pressESCAPE() {
		if (Modal.showing) Modal.closeFunc();
		else if (placeData.node) {
			placeData.node = "";
			renderLayer1();
		} else {
			paused = true;
			Modal.show({
				title: 'Paused',
				text: `<br><br>Paused`,
				close() {
					paused = false;
					Modal.close();
				},
				buttons: [{text: 'Unpause', onClick() {Modal.closeFunc()}}]
			});
		}
	},
	pressE() {
		if (Research.has("access", 1)) openMenu(351, 351);
	},
	ticks: 0
}


let walkable = [".", "^"];
function getXYfromDir(dir) {
	let {x, y} = player.pos;
	dir = Number(dir);
	switch (dir) {
		case 0: return [x + 1, y];
		case 1: return [x, y + 1];
		case 2: return [x - 1, y];
		case 3: return [x, y - 1];
	}
}
function checkTileAccess(x, y) {
	if (x > 400 || x < 0) return false;
	if (y > 400 || y < 0) return false;
	return walkable.includes(map[x][y][0]);
}
function updateTileUsage() {
	accessData.tiles = [];

	let dirList = [0, 1, 2, 3];
	for (let i in dirList) {
		let [x, y] = getXYfromDir(i);
		if (x < 0 || x > 400 || y < 0 || y > 400) return;
		if (accessData.usable.includes(map[x][y][0])) accessData.tiles.push(Number(i));
	}

	renderLayer2();
}