function load() {
	setTimeout(function() {
		let testTime = new Date().getTime();
		loadMap();
		loadPlayer();
		loadVue();
		let lastTick = new Date().getTime();
		interval = setInterval(() => {
			thisTick = new Date().getTime();
			gameLoop((new Date().getTime() - lastTick)/1000);
			lastTick = new Date().getTime();
		}, 25);
		setInterval(() => {if (player.options.autosave && !paused) save()}, 20000);
		loadCanvas();
		updateTileUsage();
		loadControls();
		console.log((new Date().getTime() - testTime) + "ms to load game");

		if (!player.loreUnlocks.start) {
			Modal.show({
				title: "The beginning of the end.",
				text: `<div style="margin: 30px;">Thousands of years have passed, and the conditions on Earth are deteriorating.<br><br>
					Due to uncontrolled capitalism, all resources have been depleted by megacorporations only seeking temporary benefits.
				</div>`,
				buttons: [{
					text: "Next",
					onClick() {
						Modal.closeFunc();
					}
				}],
				close() {
					Modal.show({
						title: "The beginning of the end.",
						text: `<div style="margin: 30px;">It was too late to save Earth, so you were tasked to explore this new planet, named Cassiopeia, and set up a new civilisation.<br><br>
							Rather unfortunately, this turned out to be a bare planet, with only sparse bits of useful resources scattered between.
							<br><br>
							Best of luck surviving.
						</div>`,
						buttons: [{
							text: "Next",
							onClick() {
								Modal.closeFunc();
							}
						}],
						close() {
							player.loreUnlocks.start = true;
							Modal.close();
						}
					})
				}
			})
		}
	}, 100);
}

function reset() {
	localStorage.setItem(saveKey, JSON.stringify(getStartPlayer()));
	localStorage.removeItem(saveKey + 'map');
	location.reload();
}


let mapSaveCode = `
function stringDecimal(str) {
	if (isNaN(str.mantissa) || isNaN(str.exponent)) {
		return "NaN";
	}

	if (str.exponent >= 1.79e308) {
		return this.mantissa > 0 ? "Infinity" : "-Infinity";
	}

	if (str.exponent <= -1.79e308 || str.mantissa === 0) {
		return "0";
	}

	if (str.exponent < 21 && str.exponent > -7) {
		return (Math.pow(10, str.exponent)*str.mantissa).toString();
	}

	return this.mantissa + "e" + (this.exponent >= 0 ? "+" : "") + this.e;
}
${_compress.toString()}
${compress.toString()}
function encodeMap(map) {
	return map.map((r, x) => r.map((p, y) => {return p[0] + ',' + stringDecimal(p[1])}).join(',,')).join(',,,')
}
function workerFunc(e) {
	//console.log(e)
	postMessage({data: compress(encodeMap(e.data.data))})
}

addEventListener('message', workerFunc)
`
let parseWorker = new Worker(URL.createObjectURL(new Blob( [mapSaveCode], {type:'text/javascript'} )))
parseWorker.onmessage = function(e) {
	localStorage.setItem(saveKey, JSON.stringify(player));
	localStorage.setItem(saveKey + 'map', e.data.data);
	Notifier.notify("Saved Game.");
}
function save() {
	Notifier.notify("Saving...");
	parseWorker.postMessage({data: map});
}

let paused = false;