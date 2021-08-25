const BUILDINGS = {
	[SPECIAL_CHARS.tri]: {
		get cost() {
			return player.buildingAmt[SPECIAL_CHARS.tri].pow(1.7).mul(1.7).add(20).round();
		},
		power: D(0),
		currencyDisplayName: "_",
		currencyInternalName: "shards",
		desc: `Produces a small amount of <span class="curr shards">_</span>`,
		name: "Drill v1",
		get subConstant() {
			return Research.has("drilling", 1) ? 9.998e6 : 9.999e6
		},
		getMult(b) {
			let mult;
			if (!Research.has("drilling", 2)) mult = 1;
			else if (isNaN(parseInt(noiseMap[b.pos.x][b.pos.y][0]))) mult = 1;
			else if (noiseMap[b.pos.x][b.pos.y][0] < 2) mult = 1;
			else mult = 3;

			for (let shrine of player.buildings[SPECIAL_CHARS.shrine]) {
				if (distGrid([b.pos.x, b.pos.y], [shrine.pos.x, shrine.pos.y]) < 3) {
					mult *= 1.5;
					break;
				}
			}

			return mult;
		},
		getProduction(b) {
			return map[b.pos.x][b.pos.y][1].sub(this.subConstant).pow(1/3).mul(0.1).mul(Research.has("drilling", 1) ? 2 : 1);
		},
		canPlace(x, y) {
			return checkTileAccess(x, y) && player.currency.shards.gte(this.cost);
		},
		startMeta(x, y) {
			return map[x][y][1].sub(this.subConstant);
		}
	},
	x: {
		get cost() {
			return player.buildingAmt.x.pow(1.7).mul(5).add(100).round();
		},
		power: D(0),
		currencyDisplayName: "_",
		currencyInternalName: "shards",
		desc: `Has a 5% chance of catching an animal each second<br>
		<i class="sub">Can only be placed on <span style="color: #44bb22">^</span>,
		uses 10 <span class="curr shards">_</span> for each capture<br></i>`,
		name: "Trap",
		canPlace(x, y) {
			return map[x][y][0] == "^" && player.currency.shards.gte(this.cost);
		},
		startMeta(x, y) {
			return {
				active: true,
				food: D(0)
			};
		}
	},
	[SPECIAL_CHARS.shrine]:  {
		get cost() {
			return player.buildingAmt[SPECIAL_CHARS.shrine].pow(2).mul(15).add(1000).round();
		},
		power: D(0),
		currencyDisplayName: SPECIAL_CHARS.meat,
		currencyInternalName: "food",
		desc: `All drills in a 5x5 area produce x1.5 the <span class="curr shards">_</span> from the same reserves.`,
		name: "Shrine",
		canPlace(x, y) {
			return checkTileAccess(x, y) && player.currency.food.gte(this.cost);
		},
		startMeta(x, y) {
			return {};
		}
	},
	[SPECIAL_CHARS.theta]: {
		get cost() {
			return player.buildingAmt[SPECIAL_CHARS.theta].pow(1.8).mul(10).add(150).round();
		},
		get shardUsage() {
			let usage = 3;
			if (Research.has("clearing", 2)) usage /= 2;

			return usage;
		},
		power: D(5),
		currencyDisplayName: "_",
		currencyInternalName: "shards",
		get desc() {
			let area = Research.has("clearing", 1) ? "9" : "7";
			return `Clears unexplored tiles in a <b>${area}x${area}</b> area<br>
			<i class="sub">Uses <span class="curr shards">_</span> when clearing tiles</i>`
		},
		name: "Area clearer",
		canPlace(x, y) {
			return checkTileAccess(x, y) && player.currency.shards.gte(this.cost);
		},
		startMeta(x, y) {
			return D(0);
		}
	},
	i: {
		cost: D(50),
		power: D(0),
		currencyDisplayName: "_",
		currencyInternalName: "shards",
		desc: "Lights up a small area.",
		name: "Torch",
		canPlace(x, y) {
			return checkTileAccess(x, y) && player.currency.shards.gte(this.cost);
		},
		startMeta(x, y) {
			return D(0);
		}
	}
}

let placeData = {
	facing: 0,
	nodeType: "tile",
	node: ""
}

const Building = {
	startPlacing(id, type) {
		let building = BUILDINGS[id];
		if (building.cost.gt(player.currency[building.currencyInternalName])) return;
		if (player.attributes.powerUsed.add(building.power).gt(player.attributes.power)) return;
		Modal.close();

		if (!player.loreUnlocks.place) {
			Modal.show({
				title: "Placing buildings",
				text: `<br><br>
				Use wasd to move around as normal, and shift+wasd to rotate the building in its place.<br>
				Press space to place the building, and esc to cancel.`,
				close() {}
			})
			setTimeout(() => {
				Modal.show({
					title: "Placing buildings",
					text: `<br><br>
					Use wasd to move around as normal, and the arrow keys to rotate the building in your place.<br>
					Press space to place the building, and esc to cancel.`,
					buttons: [{
						text: "Close",
						onClick() {Modal.close();}
					}]
				})
			}, 1000)
			player.loreUnlocks.place = true;
		}
		placeData.nodeType = type;
		placeData.node = id;
		canvas.need1update = true;
	},
	stopPlacing() {
		if (!placeData.node) return;
		let b = BUILDINGS[placeData.node];
		let [x, y] = getXYfromDir(placeData.facing);

		if (!b.canPlace(x, y)) return;

		if (b.onPlace) b.onPlace(x, y);

		player.currency[b.currencyInternalName] = player.currency[b.currencyInternalName].sub(b.cost);
		player.attributes.powerUsed = player.attributes.powerUsed.add(b.power);
		if (b.givePower) player.attributes.power = player.attributes.power.add(b.givePower);

		player.buildingAmt[placeData.node] = player.buildingAmt[placeData.node].add(1);
		player.buildings[placeData.node].push({pos: {x, y}, meta: b.startMeta(x, y)});
		if (placeData.nodeType == "tile") {
			map[x][y][0] = placeData.node;
		}
		placeData.node = "";
		canvas.need0update = true;
		canvas.need1update = true;
		updateTileUsage();
	},
	sell(x, y, type) {
		Modal.close();
		let b = BUILDINGS[type];
		if (b.onSell) b.onSell(x, y);

		player.buildings[type].splice(Building.getByPos(x, y, type, true), 1);
		player.buildingAmt[type] = player.buildingAmt[type].sub(1);
		player.currency[b.currencyInternalName] = player.currency[b.currencyInternalName].add(b.cost.mul(0.8));
		player.attributes.powerUsed = player.attributes.powerUsed.sub(b.power);
		if (b.givePower) player.attributes.power = player.attributes.power.sub(b.givePower);
		map[x][y][0] = getMapEmpty(x, y);
		render();
		updateTileUsage();
	},
	getByPos(x, y, type, id=false) {
		if (id) {
			for (let i in player.buildings[type]) {
				if (player.buildings[type][i].pos.x == x && player.buildings[type][i].pos.y == y) return i;
			}
		}
		for (let i of player.buildings[type]) {
			if (i.pos.x == x && i.pos.y == y) return i;
		}
	},
	load() {
		Vue.component("building-ui", {
			props: ["bId", "type"],
			data: () => { return {
				player,
				BUILDINGS,
				SPECIAL_CHARS,
				tileStyle,
				format,
				Building
			}},
			computed: {
				building() {
					return BUILDINGS[this.bId]
				}
			},
			template: `<div :class="{
				'building-segment': true,
				'locked': player.currency[building.currencyInternalName].lt(building.cost) ||
				player.attributes.powerUsed.add(building.power).gt(player.attributes.power)
			}" @click="Building.startPlacing(bId, type)">
				<span style="width: 50px;">
					&nbsp;
					<span :style="{color: tileStyle[bId]}" class="buildingImg">{{bId}}</span>
					&nbsp;
				</span>
				<span v-html="building.name + ': ' + building.desc" style="width: 550px; font-size: 16px; text-align: left;"></span>
				<span style="width: 100px; font-size: 18px;">
					<div style="margin-left: 5px; text-align: left;">
						{{format(building.cost, 0)}}
						<span :class="{curr: true, [building.currencyInternalName]: true}">
							{{building.currencyDisplayName}}
						</span>
						<div v-if="building.power.gt(0)">
							<span class="mid">{{format(building.power, 0)}}</span> <span class="curr power"></span>
						</div>
					</div>
				</span>
			</div>`
		})
	}
}