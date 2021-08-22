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
			hasTile = hasTile || EXPLORE.area(b.pos.x, b.pos.y, d);
		}
		render();
	},
	area(x, y, d) {
		d = player.currency.shards.min(1.5*d);
		let hasTile = 0;

		for (let i = Math.max(0, x - 3); i <= Math.min(600, x + 3); i++) {
			for (let j = Math.max(0, y - 3); j <= Math.min(600, y + 3); j++) {
				let tile = map[i][j];
				if (UNEXPLORED_DATA[tile[0]]) {
					let h = UNEXPLORED_DATA[tile[0]].health;
					let dist = 0.8 + Math.pow(distGrid([i, j], [x, y]), 2)*0.2;

					tile[1] = tile[1].sub(tile[1].mul(h).add(2).log10().recip().mul(d*2).div(h).div(dist));
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