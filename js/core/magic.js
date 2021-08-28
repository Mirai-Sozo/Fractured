const Magic = {
	Enchants: {
		LIST: {
			n1: {
				title: "Neverending reserve",
				description: "Drills use up reserves x50 slower.",
				cost: 30
			},
			n2: {
				title: "Mechanical easing",
				description: `Traps only use 1 <span class="curr shards">_</span>/capture.`,
				cost: 30
			},
			l1: {
				title: "Fountain of light",
				description: "You can increase clearing power beyond 512 with a reduced effect.",
				cost: 100
			},
			l2: {
				title: "Fountain of dark",
				description: "Pressing N gives night vision.",
				cost: 100
			}
		},
		buy(id) {
			let enc = Magic.Enchants.LIST[id];
			if (player.currency.magic.lt(enc.cost) || Magic.Enchants.has(id)) return;
			player.currency.magic = player.currency.magic.sub(enc.cost);
			player.enchants.push(id);
		},
		has(id) {
			return player.enchants.includes(id);
		},
		load() {
			Vue.component('enchant', {
				props: ["eId"],
				data: () => { return {
					player,
					Enchants: Magic.Enchants
				}},
				methods: {
					format
				},
				computed: {
					enc() {
						return Magic.Enchants.LIST[this.eId];
					}
				},
				template: `<button :class="{
					enchant: true,
					locked: player.currency.magic.lt(enc.cost) && !Enchants.has(eId),
					bought: Enchants.has(eId)
				}" @click="Enchants.buy(eId)">
					<b style="font-size: 17px; margin-bottom: 5px;" v-html="enc.title"></b>
					<span v-html="enc.description" style="margin-bottom: 5px;"></span>
					<span>Cost: {{format(enc.cost, 0)}} <span class="curr magic">*</span></span>
				</button>`
			});
		}
	},
	Spells: {
		LIST: {
			temporal: {
				name: "Temporal Hex",
				description: "Time passes x2 faster for buildings.",
				get initTime() {
					let time = 90;
					if (Research.has("magic", 2)) time *= 1.5;
					return time;
				},
				cost: 10,
			},
			artemis: {
				name: "Artemis",
				description: `Gain 40 <span class="curr food">${SPECIAL_CHARS.meat}</span> from each capture.`,
				get initTime() {
					let time = 40;
					if (Research.has("magic", 2)) time *= 1.5;
					return time;
				},
				cost: 30,
			},
			power: {
				name: "Power Burst",
				description: `Clearers briefly clear x10 faster.`,
				get initTime() {
					let time = 10;
					if (Research.has("magic", 2)) time *= 1.5;
					return time;
				},
				cost: 50
			}
		},
		buy(id) {
			let spell = Magic.Spells.LIST[id];
			if (player.currency.magic.lt(spell.cost) || Magic.Spells.has(id)) return;
			player.currency.magic = player.currency.magic.sub(spell.cost);
			player.spells[id].time = spell.initTime;
		},
		has(id) {
			return player.spells[id].time > 0;
		},
		load() {
			Vue.component('spell', {
				props: ["sId"],
				data: () => { return {
					player,
					Spells: Magic.Spells
				}},
				methods: {
					format
				},
				computed: {
					spell() {
						return Magic.Spells.LIST[this.sId];
					}
				},
				template: `<button :class="{
					spell: true,
					locked: player.currency.magic.lt(spell.cost) && !Spells.has(sId),
					bought: Spells.has(sId)
				}" @click="Spells.buy(sId)">
					<b style="font-size: 17px; margin-bottom: 2px;" v-html="spell.name + ' (' + format(player.spells[sId].time, 1) + 's)'"></b>
					<span v-html="spell.description" style="margin-bottom: 2px;"></span>
					<span>Cost: {{format(spell.cost, 0)}} <span class="curr magic">*</span></span>
				</button>`
			});
		}

	}
}