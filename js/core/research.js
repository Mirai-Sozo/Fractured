const RESEARCHES = {
	drilling: {
		name: "Drilling",
		desc: [
			"Increase maximum drill depth of the drill v1 by 1000, and double their production."
		],
		cost: [
			1000
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
		maxLvl: 1,
		canAfford: true
	},
	clearing: {
		name: "Clearing",
		desc: [
			"Increase the range of area clearers to <b>9x9</b>, and you can feed them more <span class='curr shards'>_</span> for faster clearing."
		],
		get unAffordableText() {
			return "Have at least 5 area clearers placed. Progress: " + format(player.buildingAmt[SPECIAL_CHARS.theta], 0) + "/5";
		},
		cost: [
			2500
		],
		currencyDisplayName: "_",
		currencyInternalName: "shards",
		buy(l) {},
		maxLvl: 1,
		get canAfford() {
			return player.buildingAmt[SPECIAL_CHARS.theta].gte(5);
		}
	}
}

const Research = {
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
						{{research.name}}
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
