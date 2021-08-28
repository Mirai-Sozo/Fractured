let c, c1, c2, ctx, ctx1, ctx2;

let tileStyle = {
	'.': '#c96704',
	'^': '#44bb22',
	1: '#a1dbff',
	2: '#75caff',
	3: '#47b9ff',
	4: '#0aa1ff',
	5: '#0086d9',
	6: '#0075bd',
	7: '#005a91',
	8: '#004773',
	9: '#002760',
	A: '#400000',
	B: '#670000',
	C: '#9a0000',
	D: '#b10000',
	E: '#db0000',
	F: '#ff4040',
	G: '#ff7b1c',
	x: '#bbff40',
	i: '#ffd790',
	[SPECIAL_CHARS.ohm]: '#48FF87',
	[SPECIAL_CHARS.dia]: '#ffffff',
	[SPECIAL_CHARS.house]: '#2288ff',
	[SPECIAL_CHARS.gear]: '#887777',
	[SPECIAL_CHARS.tri]: '#aaaaaa',
	V: '#afaaee',
	[SPECIAL_CHARS.shrine]: '#882722',
	[SPECIAL_CHARS.lure]: '#ffff88',
	[SPECIAL_CHARS.theta]: '#ff88ff',
	[SPECIAL_CHARS.slashO]: '#d54aff'
}

function loadCanvas() {
	c = document.querySelector("#c");
	ctx = c.getContext("2d");
	c1 = document.querySelector("#c1");
	ctx1 = c1.getContext("2d");
	c2 = document.querySelector("#c2");
	ctx2 = c2.getContext("2d");

	updateTileUsage();
	renderAll();
	window.onresize = renderAll;
}

let canvas = {
	need0update: false,
	need1update: false,
	need2update: false
}

const lights = [[351, 351], [357, 365], [300, 300]]
function calcAlpha(x, y, draw = false) {
	//return "ff";
	let alpha = 0;
	if (!controls.nightvision) {
		for (let l of lights) {
			if (distance([x, y], l) < 15)
				alpha += Math.max(0, 1 - Math.sqrt(distance([x, y], l))*0.35);
		}
	
		for (let b of player.buildings[SPECIAL_CHARS.theta]) {
			if (distGrid([x, y], [b.pos.x, b.pos.y]) < 5 && Research.has("clearing", 1)) {
				alpha += 0.7/(0.9 + Math.pow(distGrid([x, y], [b.pos.x, b.pos.y]), 2)*0.1);
			} else if (distGrid([x, y], [b.pos.x, b.pos.y]) < 4) {
				alpha += 0.7/(0.8 + Math.pow(distGrid([x, y], [b.pos.x, b.pos.y]), 2)*0.2);
			}
		}
		for (let b of player.buildings[SPECIAL_CHARS.slashO]) {
			if (x == b.pos.x && y == b.pos.y) {
				alpha = 1000;
				break;
			}
			let ang = 0.25;
	
			let hasTile = 0;
			let area = 10.9;
	
			if (distance([x, y], [b.pos.x, b.pos.y]) > area) continue;
			let angMin = (b.meta.preset - 1)*Math.PI/2,
				angMax = (b.meta.preset)*Math.PI/2;
	
			let angle = (Math.atan2(x - b.pos.x, y - b.pos.y) + Math.PI*3/2) % (Math.PI*2);
			if ((angle < angMin || angle > angMax) && !(angle == angMax % (Math.PI*2))) continue;
			alpha += 1/(0.8 + Math.pow(distance([x, y], [b.pos.x, b.pos.y]), 1.5)*0.2);
		}
	
		for (let b of player.buildings.i) {
			if (distance([x, y], [b.pos.x, b.pos.y]) < 10)
				alpha += Math.max(0, 0.8 - Math.sqrt(distance([x, y], [b.pos.x, b.pos.y]))*0.25);
		}
		if (distance([x, y], [player.pos.x, player.pos.y]) < 20)
			alpha += Math.max(0, 0.8 - Math.sqrt(distance([x, y], [player.pos.x, player.pos.y]))*0.3);
	
		if (player.attributes.health.lte(80)) alpha /= (95 - player.attributes.health)/15;
		alpha = Math.min(alpha, 1);
	} else {
		alpha = 1;
	}


	if (draw && UNEXPLORED_DATA[map[x][y][0]]) {
		if (map[x][y][1].lt(1)) {
			let tile = getMapEmpty(x, y);
			ctx.fillStyle = (tileStyle[tile] ?? "#ffffff") + (
				'0' + Math.round((alpha*(1 - map[x][y][1]))*255).toString(16)).slice(-2);

			let [i, j] = getPosInCanvas(x, y);
			ctx.fillText(tile, i, j + 25);

			alpha = alpha*map[x][y][1];
		}
	}
	alpha = Math.round(alpha*255);

	return ('0' + alpha.toString(16)).slice(-2);
}

function getPosInCanvas(x, y) {
	return [(x - player.pos.x + Math.floor(Math.floor(c.width/20)/2))*20 + 10,
	(y - player.pos.y + Math.floor(Math.floor(c.height/25)/2))*25]
}
function getMapByCanvas(x, y) {
	let posX = Math.floor(x/20),
		posY = Math.floor(y/25);
	return [posX + player.pos.x - Math.floor(Math.floor(c.width/20)/2),
	posY + player.pos.y - Math.floor(Math.floor(c.height/25)/2)];
}

function updateUnexploredTile(event) {
	let [x, y] = getMapByCanvas(event.offsetX, event.offsetY);
	darknessTooltip = [];
	if (x < 0 || x > 400 || y < 0 || y > 400) return renderLayer2();

	let tile = map[x][y];
	if (!UNEXPLORED_DATA[tile[0]] || parseInt(calcAlpha(x, y), 16) < 5) return renderLayer2();

	darknessTooltip = [x, y,
	format(tile[1].mul(UNEXPLORED_DATA[tile[0]].health), 0) +
	'/' + format(UNEXPLORED_DATA[tile[0]].health, 0)];
	renderLayer2();
}

function tooltipText(context, x, y, text, arrowDir = "top") {
	context.font = '18px Iosevka Term SS08 Web';
	context.textAlign = "center";

	context.strokeStyle = "#fff";
	context.fillStyle = "#000b";
	context.lineWidth = 2;
	let yDiff = arrowDir == "top" ? -25 : 32;
	let length = context.measureText(text).width + 8,
		xDiff = length/2;
	context.fillRect(x - xDiff, y + yDiff, length, 25);
	context.strokeRect(x - xDiff, y + yDiff, length, 25);

	context.fillStyle = "#fff";
	context.beginPath();
	if (arrowDir == "top") {
		context.moveTo(x - 5, y);
		context.lineTo(x + 5, y);
		context.lineTo(x, y + 5);
	} else {
		context.moveTo(x - 5, y + 32);
		context.lineTo(x + 5, y + 32);
		context.lineTo(x, y + 27);
	}

	context.fill();

	context.fillText(text, x, y + yDiff + 19);
}

function render() {
	c.width = window.innerWidth - 4;
	c.height = window.innerHeight - 114;
	ctx.font = '25px Iosevka Term SS08 Web';
	ctx.textAlign = "center";

	let width = Math.floor(c.width/20),
		height = Math.floor(c.height/25);

	for (let i = 0; i <= width; i++) {
		let x = i + player.pos.x - Math.floor(width/2);
		if (x < 0 || x > 420) continue;
		for (let j = 0; j <= height; j++) {
			let y = j + player.pos.y - Math.floor(height/2);
			if (y < 0 || y > 420) continue;
			let tile = map[x][y][0];

			if (x == player.pos.x && y == player.pos.y)
				tile = SPECIAL_CHARS.ohm;

			ctx.fillStyle = (tileStyle[tile] ?? "#ffffff") + calcAlpha(x, y, true);
			if (Research.has("access", 2)) {
				let sub, max;
				switch (placeData.node) {
					case SPECIAL_CHARS.tri:
						sub = BUILDINGS[SPECIAL_CHARS.tri].subConstant,
						max = 1e7 - sub;
						if (tile == getMapEmpty(x, y) && map[x][y][1] - sub < max/10) {
							ctx.fillStyle = "#ff0000" + calcAlpha(x, y, true);
							ctx.shadowColor = "#ff0000";
							ctx.shadowBlur = 15;
							tile = "-"
						}

						break;
					case 'V':
						sub = BUILDINGS.V.subConstant,
						max = 1e7 - sub;
						if (tile == getMapEmpty(x, y) && map[x][y][1] - sub < max/10) {
							ctx.fillStyle = "#ff0000" + calcAlpha(x, y, true);
							ctx.shadowColor = "#ff0000";
							ctx.shadowBlur = 15;
							tile = "-"
						}

						break;
				}
			}
			ctx.fillText(tile, i*20 + 10, j*25 + 25);
			ctx.shadowBlur = 0;
		}
	}
}

function renderLayer1() {
	c1.width = window.innerWidth - 4;
	c1.height = window.innerHeight - 114;

	if (placeData.node) {
		ctx1.font = '25px Iosevka Term SS08 Web';
		ctx1.textAlign = "center";

		let [x, y] = getXYfromDir(placeData.facing);
		let [px, py] = getPosInCanvas(x, y);
		py += 25;

		ctx1.shadowBlur = 15;
		if (!BUILDINGS[placeData.node].canPlace(x, y)) {
			ctx1.fillStyle = "#f00";
			ctx1.shadowColor = "#f00"
		} else {
			ctx1.fillStyle = tileStyle[placeData.node];
			ctx1.shadowColor = tileStyle[placeData.node];
		}

		ctx1.fillText(placeData.node, px, py)
	}
}

let darknessTooltip = [];
function renderLayer2() {
	c2.width = window.innerWidth - 4;
	c2.height = window.innerHeight - 114;

	if (player.options.showTilePopups) {
		ctx2.font = '18px Iosevka Term SS08 Web';
		ctx2.textAlign = "center";
	
		for (let i of accessData.tiles) {
			let [x, y] = getPosInCanvas(...getXYfromDir(i));
			let text = "Use [" + ["D", "S", "A", "W"][i] + "]";
			if (i == 1 || i == 2) {
				tooltipText(ctx2, x, y, text, "bottom");
			} else {
				tooltipText(ctx2, x, y, text, "top");
			}
		}
	}
	if (darknessTooltip.length && player.options.showTileU) {
		let d = darknessTooltip;
		let [x, y] = getPosInCanvas(d[0], d[1])
		tooltipText(ctx2, x, y, darknessTooltip[2], "top");
	}
	if (controls.compass) {
		ctx2.fillStyle = "#17141188";
		ctx2.strokeStyle = "#fff";
		ctx2.lineWidth = 5;
		ctx2.beginPath();
		let [x, y] = getPosInCanvas(player.pos.x, player.pos.y);
		y += 12.5;
		ctx2.arc(x, y, 100, 0, Math.PI*2);
		ctx2.fill();
		ctx2.stroke();
		ctx2.lineCap = "round";

		for (let t of SPECIAL_TILES) {
			if (!(t.show ?? true)) continue;
			let distVec = [t.pos.x - player.pos.x, t.pos.y - player.pos.y];
			distVec = distVec.map(c => c*90/distance(distVec, [0, 0]));

			ctx2.strokeStyle = tileStyle[t.tile];
			ctx2.beginPath();
			ctx2.moveTo(x, y);
			ctx2.lineTo(x + distVec[0], y + distVec[1]);
			ctx2.stroke();
		}
	}
}

function renderAll() {
	render();
	renderLayer1();
	renderLayer2();
}