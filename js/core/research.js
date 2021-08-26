const RESEARCHES = {
	drilling: {
		name: "Drilling",
		desc: [
			"Increase maximum drill depth of the drill v1 by 1000, and double their production.",
			"Drills built on a tile coming from a 2 or higher produce x3 the <span class='curr shards'>_</span> from the same reserves.",
			"Unlock the drill v2."
		],
		cost: [
			1000,
			4000,
			1.5e5
		],
		currencyDisplayName: "_",
		currencyInternalName: "shards",
		buy(l) {
			if (l == 0) {
				for (let b of player.buildings[SPECIAL_CHARS.tri]) {
					b.meta = b.meta.add(1000);
				}
			}
		},
		maxLvl: 3,
		canAfford: true
	},
	trapping: {
		name: "Trapping",
		desc: [
			`Excess <span class='curr food'>${SPECIAL_CHARS.meat}</span> from traps is collected a currency.<br>
			<i class='sub'>This isn't useless, check the buildings menu!</i>`,
			`Automatically collect <span class='curr food'>${SPECIAL_CHARS.meat}</span> from traps.`
		],
		bReqList: [
			10,
			15,
			0
		],
		get bReq() {
			return this.bReqList[player.research.trapping];
		},
		get unAffordableText() {
			return "Have at least " + this.bReq + " traps placed. Progress: " + format(player.buildingAmt.x, 0) + "/" + this.bReq;
		},
		cost: [
			3000,
			30000
		],
		get currencyDisplayName() {
			return Research.has("trapping", 2) ? SPECIAL_CHARS.meat : "_"
		},
		get currencyInternalName() {
			return Research.has("trapping", 2) ? "food" : "shards"
		},
		buy(l) {
			if (l == 1) {
				for (let b of player.buildings.x) {
					BUILDINGS.x.collect(b);
				}
			}
		},
		maxLvl: 2,
		get canAfford() {
			return player.buildingAmt.x.gte(this.bReq);
		}
	},
	clearing: {
		name: "Clearing",
		desc: [
			"Increase the range of area clearers to <b>9x9</b>, and you can feed them more <span class='curr shards'>_</span> for faster clearing.",
			"Increase the clearing power limit to 512, and reduce <span class='curr shards'>_</span> usage by 50%.",
			"Unlock sector clearers."
		],
		bReqList: [
			5,
			9,
			15,
			0
		],
		get bReq() {
			return this.bReqList[player.research.clearing];
		},
		get unAffordableText() {
			return "Have at least " + this.bReq + " area clearers placed. Progress: " + format(player.buildingAmt[SPECIAL_CHARS.theta], 0) + "/" + this.bReq;
		},
		cost: [
			2500,
			1e4,
			5e5
		],
		currencyDisplayName: "_",
		currencyInternalName: "shards",
		buy(l) {},
		maxLvl: 3,
		get canAfford() {
			return player.buildingAmt[SPECIAL_CHARS.theta].gte(this.bReq);
		}
	},
	access: {
		name: "Access",
		desc: [
			"You can press E to open the building menu at any time.",
			"Tiles with very few resources are highlighted in red when attempting to place a drill.",
			"You can press R to open the research menu at any time.",
		],
		cost: [
			100,
			1e4,
			5e4
		],
		currencyDisplayName: "_",
		currencyInternalName: "shards",
		buy(l) {},
		maxLvl: 3,
		get unAffordableText() {
			return "Have at least 30 drill v1s placed. Progress: " +  + format(player.buildingAmt[SPECIAL_CHARS.tri], 0) + "/30";
		},
		get canAfford() {
			return player.buildingAmt[SPECIAL_CHARS.tri].gte(30) || Research.has("access", 1);
		}
	}
}

const Research = {
	has(id, lvl) {
		return player.research[id] >= lvl
	},
	buy(id) {
		const r = RESEARCHES[id];
		if (player.research[id] >= r.maxLvl || player.currency[r.currencyInternalName].lt(r.cost[player.research[id]])) return;
        if (!r.canAfford) return;
		r.buy(player.research[id]);
		player.currency[r.currencyInternalName] = player.currency[r.currencyInternalName].sub(r.cost[player.research[id]]);
		player.research[id]++;
	},
	load() {
		Vue.component('research-ui', {
			props: ["rId"],
			data: () => { return {
				player,
				RESEARCHES,
				Research,
				format,
				Math
			}},
			computed: {
				research() {
					return RESEARCHES[this.rId]
				},
				lvl() {
					return player.research[this.rId];
				}
			},
			template: `<div :class="{
				'research-segment': true,
				'locked': player.currency[research.currencyInternalName].lt(research.cost[lvl]) ||
				lvl >= research.maxLvl || !research.canAfford
			}" @click="Research.buy(rId)">
				<div style="text-align: left; width: 595px">
					<span style="font-size: 20px;">
						{{research.name}} {{Math.min(player.research[rId] + 1, research.maxLvl)}}
					</span><br>
					<span v-html="research.canAfford ? research.desc[lvl] : research.unAffordableText"
					style="font-size: 16px; text-align: left;" v-if="lvl < research.maxLvl"></span>
					<span style="font-size: 16px; text-align: left;" v-else>(MAXED)</span>
				</div>
				<span style="width: 85px; font-size: 20px;" v-if="lvl < research.maxLvl">
					<div style="margin-left: 5px; text-align: left;">
						{{format(research.cost[lvl], 0)}}
						<span :class="{curr: true, [research.currencyInternalName]: true}">
							{{research.currencyDisplayName}}
						</span>
					</div>
				</span>
			</div>`
		})
	}
}
