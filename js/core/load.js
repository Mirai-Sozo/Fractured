function load() {
	setTimeout(function() {
		let testTime = Date.now();
		loadMap();
		loadPlayer();
		loadVue();
		let lastTick = Date.now();
		interval = setInterval(() => {
			thisTick = Date.now();
			gameLoop((Date.now() - lastTick)/1000);
			lastTick = Date.now();
		}, 25);
		setInterval(() => {if (player.options.autosave && !paused) save()}, 20000);
		loadCanvas();
		updateTileUsage();
		loadControls();
		console.log((Date.now() - testTime) + "ms to load game");

		if (!player.loreUnlocks.start) {
			Modal.show({
				title: "The beginning of the end.",
				text: `<div style="margin: 30px;">Thousands of years have passed, and the conditions on Earth are deteriorating.<br><br>
					Almost all the resources have run out, and it was projected that we would be completely devoid of new resources in 5 years.
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
						text: `<div style="margin: 30px;">It was too late to save Earth, so many missions to space were planned.<br>
							You were tasked to explore this new planet, named Cassiopeia, and set up a new civilisation.<br><br>
							Rather unfortunately, this turned out to be a bare planet, with only sparse bits of useful resources scattered in between.
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

	return this.mantissa + "e" + (this.exponent >= 0 ? "+" : "") + this.exponent;
}
function encodeMap(map) {
	return map.map((r, x) => r.map((p, y) => {return p[0] + stringDecimal(p[1])}).join(',')).join('#')
}
function workerFunc(e) {
	postMessage(encodeMap(e.data))
}

addEventListener('message', workerFunc)
`
let parseWorker = new Worker(URL.createObjectURL(new Blob( [mapSaveCode], {type:'text/javascript'} )))
parseWorker.onmessage = function(e) {
	localStorage.setItem(saveKey, JSON.stringify(player));
	localStorage.setItem(saveKey + 'map', e.data);
	Notifier.notify("Saved Game.");
}
function save() {
	Notifier.notify("Saving...");
	parseWorker.postMessage(map);
}

let paused = false;