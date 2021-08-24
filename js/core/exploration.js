let UNEXPLORED_DATA = {
	1: {
		health: D(40),
	},
	2: {
		health: D(400)
	},
	3: {
		health: D(10000)
	}
}

let EXPLORE = {
	all(d) {
		let hasTile = false;
		for (let b of player.buildings[SPECIAL_CHARS.theta]) {
			hasTile = EXPLORE.area(b.pos.x, b.pos.y, d) || hasTile;
		}
		if (hasTile) {
			render();
			renderLayer1();
		}
	},
	area(x, y, d) {
		let clearPower = Decimal.pow(2, Building.getByPos(x, y, SPECIAL_CHARS.theta).meta);
		d = player.currency.shards.min(clearPower.mul(3*d));
		let hasTile = 0;
		let area = player.research.clearing >= 1 ? 4 : 3;

		for (let i = Math.max(0, x - area); i <= Math.min(480, x + area); i++) {
			for (let j = Math.max(0, y - area); j <= Math.min(480, y + area); j++) {
				let tile = map[i][j];
				if (UNEXPLORED_DATA[tile[0]]) {
					let h = UNEXPLORED_DATA[tile[0]].health;
					let dist = player.research.clearing >= 1 ? 0.9 + Math.pow(distGrid([i, j], [x, y]), 2)*0.1
					: 0.8 + Math.pow(distGrid([i, j], [x, y]), 2)*0.2;

					tile[1] = tile[1].sub(tile[1].mul(h).add(2).log10().recip().mul(d).div(h).div(dist)).min(1);
					if (tile[1].lte(0)) {
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
						renderLayer2();
					}
					hasTile = true;
				}
			}
		}

		if (hasTile) player.currency.shards = player.currency.shards.sub(d);

		return hasTile;
	}
}
