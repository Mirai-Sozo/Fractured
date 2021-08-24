function Updater(func) {
	this.id = Updater.length;
	Updater.updates.push({
		func,
		running: true
	});
	this.updater = Updater.updates[this.id];
}
Updater.updates = [];

function gameLoop(d) {
	if (paused) return;
	d = Math.min(d, 10);
	player.time.timeStat += d;
	player.time.thisTick = new Date().getTime();

	if (player.loreUnlocks.start && player.attributes.health.gt(0)) {
		for (let b of player.buildings[SPECIAL_CHARS.tri]) {
			let tile = map[b.pos.x][b.pos.y];
	
			if (tile[1].gt(0)) {
				let gain = b.meta.min(BUILDINGS[SPECIAL_CHARS.tri].getProduction(b).mul(d));

				player.currency.shards = player.currency.shards.add(gain.mul(BUILDINGS[SPECIAL_CHARS.tri].getMult(b)));
				tile[1] = tile[1].sub(gain);
				b.meta = b.meta.sub(gain);
			}
		}
		for (let b of player.buildings.x) {
			if (Math.random() < 1 - Math.pow(0.9, d) && b.meta.active && player.currency.shards.gte(10)) {
				b.meta.food = b.meta.food.add(15);
				player.currency.shards = player.currency.shards.sub(10);
			}
		}
		EXPLORE.all(d);
	
		player.attributes.food = player.attributes.food.sub(0.2*d).max(0);
	
		if (player.attributes.food.lte(0)) {
			player.attributes.health = player.attributes.health.sub(2*d).max(0);
		} else if (player.attributes.health.lt(100) && player.attributes.food.gte(20)) {
			player.attributes.health = player.attributes.health.add(4*d).min(100);
			player.attributes.food = player.attributes.food.sub(2*d).max(20);
		}
	
		if (player.attributes.health.lte(0)) {
			Modal.show({
				title: "",
				text: `<br><br><h1>You died!</h1>`,
				close() {
					reset();
				},
				buttons: [{
					text: "Start over",
					onClick() {
						reset();
					}
				}]
			})
		}
	} else if (player.attributes.health.lte(0)) {
		Modal.show({
			title: "",
			text: `<br><br><h1>You died!</h1>`,
			close() {
				reset();
			},
			buttons: [{
				text: "Start over",
				onClick() {
					reset();
				}
			}]
		})
	}

	for (let i in Updater.updates) {
		let obj = Updater.updates[i];
		if (obj.running) obj.func(d);
	}
}

let interval;