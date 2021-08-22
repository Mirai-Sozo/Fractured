let map, noiseMap;

let SPECIAL_TILES = [{
	pos: {x: 351, y: 351},
	tile: SPECIAL_CHARS.dia,
	meta: D(0)
}, {
	pos: {x: 357, y: 365},
	tile: SPECIAL_CHARS.house,
	meta: D(0)
}]
function loadMap() {
	let layer1 = Lerp(Noise(25, 25, undefined, 0.45), 20)
	let layer2 = Lerp(Noise(41, 41, undefined, 0.45), 15);
	let layer3 = Lerp(Noise(101, 101, undefined, 0.3), 6);

	noiseMap = layer1.map((x, i) => x.map((y, j) => {
		let tile = Math.floor(y + layer2[i][j] + layer3[i][j] + 
			Math.pow(Math.max(distance([i, j], [351, 351])/9 - 0.18, 0), 0.65));
		if (x >= 355 && y >= 360 && x <= 357 && y <= 362) tile = 0;
		if (tile == 0) return [getMapEmpty(x, y), D(1e7)];
		else return [tile.toString(36).toUpperCase(), D(1)]
	}));

	for (let i of SPECIAL_TILES) {
		noiseMap[i.pos.x][i.pos.y] = [i.tile, i.meta];
	}
	if (localStorage.getItem(saveKey + 'map') != null) {
		map = decodeMap(LZString.decompress(localStorage.getItem(saveKey + 'map')));
	}
	else map = noiseMap.map(_=>_.slice());

	for (let i of SPECIAL_TILES) {
		map[i.pos.x][i.pos.y] = [i.tile, i.meta];
	}
}
function decodeMap(map) {
	return map.split(',,,').map(r => r.split(',,').map(p => [p[0], D(p.slice(2))]))
}

function getMapEmpty(x, y) {
	if (distance([x, y], [370, 390]) <= 35) return '^'
	return '.'
}