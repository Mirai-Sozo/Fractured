let UNEXPLORED_DATA = {
	1: {
		health: D(40),
	},
	2: {
		health: D(400)
	},
	3: {
		health: D(24000)
	},
	4: {
		health: D(1e5)
	},
	5: {
		health: D(5e5)
	},
	6: {
		health: D(1e6)
	},
	7: {
		health: D(3e6)
	},
	8: {
		health: D(1e7)
	},
	9: {
		health: D(3e7)
	},
	A: {
		health: D(2e8)
	},
	B: {
		health: D(1e9)
	},
	C: {
		health: D(1e10)
	},
	D: {
		health: D(3e11)
	}
}

let EXPLORE = {
	all(d) {
		let hasTile = false;
		let testTime = Date.now();
		for (let b of player.buildings[SPECIAL_CHARS.theta]) {
			hasTile = EXPLORE.area(b.pos.x, b.pos.y, d) || hasTile;
		}
		for (let b of player.buildings[SPECIAL_CHARS.slashO]) {
			hasTile = EXPLORE.sector(b, d) || hasTile;
		}
		if (hasTile) {
			canvas.need0update = true;
			canvas.need1update = true;
		}
	},
	area(x, y, d) {
		let clearPower = Decimal.pow(2, polysoft(Building.getByPos(x, y, SPECIAL_CHARS.theta).meta, 9)),
			shardMult = Decimal.pow(2, Building.getByPos(x, y, SPECIAL_CHARS.theta).meta);
		d = player.currency.shards.min(shardMult.mul(3*d));
		let hasTile = 0;
		let area = player.research.clearing >= 1 ? 4 : 3;

		for (let i = Math.max(0, x - area); i <= Math.min(420, x + area); i++) {
			for (let j = Math.max(0, y - area); j <= Math.min(420, y + area); j++) {
				let tile = map[i][j];
				if (UNEXPLORED_DATA[tile[0]]) {
					let h = UNEXPLORED_DATA[tile[0]].health;
					let dist = Research.has("clearing", 1) ? 0.9 + Math.pow(distGrid([i, j], [x, y]), 2)*0.1
					: 0.8 + Math.pow(distGrid([i, j], [x, y]), 2)*0.2;

					tile[1] = tile[1].sub(tile[1].mul(h).add(2).log10().recip()
						.mul(d.mul(clearPower).div(shardMult)).mul(Magic.Spells.has("power") ? 5 : 1)
						.div(h).div(dist)).min(1);
					if (tile[1].lte(0)) {
						player.loreUnlocks.highestCleared = Math.max(player.loreUnlocks.highestCleared, tile[0]);
						tile[0] = getMapEmpty(i, j);
						tile[1] = D(1e7);
					}

					let dT = darknessTooltip;
					if (i == dT[0] && j == dT[1]) {
						if (!UNEXPLORED_DATA[tile[0]]) {
							darknessTooltip = [];
						} else {
							dT[2] = format(tile[1].mul(h), 0) +
							'/' + format(h, 0);
						}
						canvas.need2update = true;
					}
					hasTile = true;
				}
			}
		}

		if (hasTile) player.currency.shards = player.currency.shards.sub(d*BUILDINGS[SPECIAL_CHARS.theta].shardUsage/3);

		return hasTile;
	},
	sector(b, d) {
		let clearPower = Decimal.pow(2, polysoft(b.meta.power, 9)),
			shardMult = Decimal.pow(2, b.meta.power);
		let ang = 0.25;
		let secs = {
			q1: false, q2: false, q3: false, q4: false
		};
		secs["q" + b.meta.preset] = true;
		let {x, y} = b.pos;

		d = player.currency.shards.min(shardMult.mul(d));
		let hasTile = 0;
		let area = 11;

		for (let i = Math.max(0, x - area*(secs.q2 || secs.q3)); i <= Math.min(420, x + area*(secs.q1 || secs.q4)); i++) {
			for (let j = Math.max(0, y - area*(secs.q1 || secs.q2)); j <= Math.min(420, y + area*(secs.q3 || secs.q4)); j++) {
				if (distance([x, y], [i, j]) > area) continue;
				let tile = map[i][j];
				if (UNEXPLORED_DATA[tile[0]]) {
					let h = UNEXPLORED_DATA[tile[0]].health;
					let dist = 0.8 + Math.pow(distance([x, y], [b.pos.x, b.pos.y]), 1.5)*0.2;

					tile[1] = tile[1].sub(tile[1].mul(h).add(2).log10().recip()
						.mul(d.mul(clearPower).div(shardMult)).mul(Magic.Spells.has("power") ? 10 : 1)
						.div(h).div(dist).div(ang)).min(1);
					if (tile[1].lte(0)) {
						player.loreUnlocks.highestCleared = Math.max(player.loreUnlocks.highestCleared, tile[0]);
						tile[0] = getMapEmpty(i, j);
						tile[1] = D(1e7);
					}

					let dT = darknessTooltip;
					if (i == dT[0] && j == dT[1]) {
						if (!UNEXPLORED_DATA[tile[0]]) {
							darknessTooltip = [];
						} else {
							dT[2] = format(tile[1].mul(h), 0) +
							'/' + format(h, 0);
						}
						canvas.need2update = true;
					}
					hasTile = true;
				}
			}
		}
		if (hasTile) player.currency.shards = player.currency.shards.sub(d.mul(BUILDINGS[SPECIAL_CHARS.slashO].shardUsage));

		return hasTile;
	}
}
