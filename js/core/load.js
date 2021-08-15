function load() {
	loadPlayer();
	loadVue();
	let lastTick = new Date().getTime();
	interval = setInterval(() => {
		thisTick = new Date().getTime();
		gameLoop(new Date().getTime() - lastTick);
		lastTick = new Date().getTime();
	}, 25);
	setInterval(() => {
		localStorage.setItem(saveKey, JSON.stringify(player));
		Notifier.notify("Saved Game")
	}, 10000);
	loadCanvas();
}