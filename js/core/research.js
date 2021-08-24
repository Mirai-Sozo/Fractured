const RESEARCHES = {
	drilling: {
		name: "Drilling",
		desc: [
			"Increase maximum drill depth of the drill v1 by 1000, and double their production.",
			"Drills built on a tile coming from a 2 or higher produce x3 as much <span class='curr shards'>_</span> from the same amount of reserves."
		],
		cost: [
			1000,
			4000
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
		maxLvl: 2,
		canAfford: true
	},
	clearing: {
		name: "Clearing",
		desc: [
			"Increase the range of area clearers to <b>9x9</b>, and you can feed them more <span class='curr shards'>_</span> for faster clearing.",
			"Increase the clearing power limit to 512, and reduce <span class='curr shards'>_</span> usage by 50%."
		],
		bReqList: [
			5,
			9,
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
			1e4
		],
		currencyDisplayName: "_",
		currencyInternalName: "shards",
		buy(l) {},
		maxLvl: 2,
		get canAfford() {
			return player.buildingAmt[SPECIAL_CHARS.theta].gte(this.bReq);
		}
	},
	access: {
		name: "Access",
		desc: [
			"You can press E to open the building menu at any time."
		],
		cost: [
			100
		],
		currencyDisplayName: "_",
		currencyInternalName: "shards",
		buy(l) {},
		maxLvl: 1,
		get unAffordableText() {
			return "Have at least 30 drill v1s placed. Progress: " +  + format(player.buildingAmt[SPECIAL_CHARS.tri], 0) + "/30";
		},
		get canAfford() {
			return player.buildingAmt[SPECIAL_CHARS.tri].gte(30);
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
				format
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
						{{research.name}} {{player.research[rId] + 1}}
					</span><br>
					<span v-html="research.canAfford ? research.desc[lvl] : research.unAffordableText"
					style="font-size: 16px; text-align: left;" v-if="lvl < research.maxLvl"></span>
					<span style="font-size: 16px; text-align: left;" v-else>(MAXED)</span>
				</div>
				<span style="width: 95px; font-size: 20px;" v-if="lvl < research.maxLvl">
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
