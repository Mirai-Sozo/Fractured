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
	9: '#002740',
	A: '#000000',
	B: '#470000',
	C: '#7a0000',
	D: '#a10000',
	E: '#db0000',
	F: '#ff4040',
	G: '#ff7b1c',
	x: '#44ff22',
	[SPECIAL_CHARS.ohm]: '#48FF87',
	[SPECIAL_CHARS.dia]: '#ffffff',
	[SPECIAL_CHARS.house]: '#2288ff',
	[SPECIAL_CHARS.tri]: '#aaaaaa',
	[SPECIAL_CHARS.theta]: '#ff88ff'
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

const lights = [[351, 351], [357, 365]]
function calcAlpha(x, y, draw = false) {
	//return "ff";
	let alpha = 0;
	for (let l of lights) {
		if (distance([x, y], l) < 15)
			alpha += Math.max(0, 1 - Math.sqrt(distance([x, y], l))*0.35);
	}
	for (let b of player.buildings[SPECIAL_CHARS.theta]) {
		if (distGrid([x, y], [b.pos.x, b.pos.y]) < 4) {
			alpha += 0.7/(0.8 + Math.pow(distGrid([x, y], [b.pos.x, b.pos.y]), 2)*0.2);
		}
	}
	if (distance([x, y], [player.pos.x, player.pos.y]) < 20)
		alpha += Math.max(0, 0.8 - Math.sqrt(distance([x, y], [player.pos.x, player.pos.y]))*0.3);

	alpha = Math.min(alpha, 1);

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
		if (x < 0 || x > 400) continue;
		for (let j = 0; j <= height; j++) {
			let y = j + player.pos.y - Math.floor(height/2);
			if (y < 0 || y > 400) continue;
			let tile = map[x][y][0];

			if (x == player.pos.x && y == player.pos.y)
				tile = SPECIAL_CHARS.ohm;

			ctx.fillStyle = (tileStyle[tile] ?? "#ffffff") + calcAlpha(x, y, true);
			ctx.fillText(tile, i*20 + 10, j*25 + 25);
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
		if (darknessTooltip.length) {
			let d = darknessTooltip;
			let [x, y] = getPosInCanvas(d[0], d[1])
			tooltipText(ctx2, x, y, darknessTooltip[2], "top");
		}
	}
}

function renderAll() {
	render();
	renderLayer1();
	renderLayer2();
}