function loadMenus() {
	Vue.component('crystal-menu', {
		data: () => { return {
			player,
			Research,
			SPECIAL_CHARS
		}},
		template: `<div style='text-align: center; overflow-y: auto; height: 454px;'>
			<building-ui :bId="SPECIAL_CHARS.tri" type="tile"></building-ui>
			<building-ui :bId="'V'" type="tile" v-if="Research.has('drilling', 3)"></building-ui>
			<building-ui :bId="'x'" type="tile"></building-ui>
			<building-ui :bId="SPECIAL_CHARS.shrine" type="tile" v-if="Research.has('trapping', 1)"></building-ui>
			<building-ui :bId="SPECIAL_CHARS.theta" type="tile"></building-ui>
			<building-ui :bId="SPECIAL_CHARS.slashO" v-if="Research.has('clearing', 3)" type="tile"></building-ui>
			<div class="building-segment" style="height: 40px; cursor: default;"></div>
			<building-ui :bId="'i'" type="tile"></building-ui>
		</div>`
	})
	Vue.component('research-menu', {
		data: () => { return {
			player
		}},
		template: `<div style='text-align: center; overflow-y: auto; height: 454px;'>
			<research-ui :rId="'drilling'"></research-ui>
			<research-ui :rId="'trapping'"></research-ui>
			<research-ui :rId="'clearing'"></research-ui>
			<research-ui :rId="'access'"></research-ui>
		</div>`
	})
	Building.load();
	Research.load();

	Vue.component('drillv1-menu', {
		props: ["data"],
		data: () => { return {
			Research,
			player,
			BUILDINGS,
			SPECIAL_CHARS,
			Building
		}},
		methods: {
			format
		},
		computed: {
			building() {
				return Building.getByPos(this.data.x, this.data.y, SPECIAL_CHARS.tri);
			}
		},
		template: `<div style='padding: 10px;'>
			<h1>Drill V1</h1>
			Stats:<br>
			{{format(BUILDINGS[SPECIAL_CHARS.tri].getProduction(building).mul(BUILDINGS[SPECIAL_CHARS.tri].getMult(building)))}}
			<span class="curr shards">_</span>/s
			<br>
			Reserves:
			{{format(building.meta, 0)}}/{{Research.has('drilling', 1) ? "2000" : "1000"}} <span class="curr shards">_</span>
			<br><br><br><br>
			<button @click="Building.sell(data.x, data.y, SPECIAL_CHARS.tri)">Sell for 80% of original price</button>
		</div>`
	})
	Vue.component('drillv2-menu', {
		props: ["data"],
		data: () => { return {
			Research,
			player,
			BUILDINGS,
			SPECIAL_CHARS,
			Building
		}},
		methods: {
			format
		},
		computed: {
			building() {
				return Building.getByPos(this.data.x, this.data.y, 'V');
			}
		},
		template: `<div style='padding: 10px;'>
			<h1>Drill V2</h1>
			Stats:<br>
			{{format(BUILDINGS.V.getProduction(building).mul(BUILDINGS.V.getMult(building)))}}
			<span class="curr shards">_</span>/s
			<br>
			Reserves:
			{{format(building.meta, 0)}}/20000 <span class="curr shards">_</span>
			<br><br><br><br>
			<button @click="Building.sell(data.x, data.y, 'V')">Sell for 80% of original price</button>
		</div>`
	})

	Vue.component('trap-menu', {
		props: ["data"],
		data: () => { return {
			BUILDINGS,
			SPECIAL_CHARS,
			Building
		}},
		methods: {
			format,
			collect: BUILDINGS.x.collect,
			toggleActive() {
				this.building.meta.active = !this.building.meta.active;
			}
		},
		computed: {
			building() {
				return Building.getByPos(this.data.x, this.data.y, 'x');
			}
		},
		template: `<div style='padding: 10px;'>
			<h1>Trap ({{building.meta.active ? "ACTIVE" : "INACTIVE"}})</h1>
			Stats:<br>
			5% chance of capture/s, 15 <span class="curr food">{{SPECIAL_CHARS.meat}}</span>/capture | 
			-10 <span class="curr shards">_</span>/capture
			<br>
			Reserves:
			{{format(building.meta.food, 0)}} <span class="curr food">{{SPECIAL_CHARS.meat}}</span>
			<br><br>
			<button @click="collect(building)">Collect</button>
			<br><br>
			<button @click="toggleActive()">{{building.meta.active ? "Deactivate" : "Activate"}} trap</button>
			<br><br><br><br>
			<button @click="Building.sell(data.x, data.y, 'x')">Sell for 80% of original price</button>
		</div>`
	})
	Vue.component('shrine-menu', {
		props: ["data"],
		data: () => { return {
			Building
		}},
		template: `<div style='padding: 10px;'>
			<h1>Shrine</h1>
			<br><br><br><br>
			<button @click="Building.sell(data.x, data.y, SPECIAL_CHARS.shrine)">Sell for 80% of original price</button>
		</div>`
	})

	Vue.component('areaclearer-menu', {
		props: ["data"],
		data: () => { return {
			player,
			Research,
			BUILDINGS,
			SPECIAL_CHARS,
			Building,
			Decimal
		}},
		methods: {
			format
		},
		computed: {
			building() {
				return Building.getByPos(this.data.x, this.data.y, SPECIAL_CHARS.theta);
			},
			maxPow() {
				let pow = 6;
				if (Research.has("clearing", 2)) pow = 9;

				return pow;
			}
		},
		template: `<div style='padding: 10px;'>
			<h1>Area clearer</h1>
			Stats:<br>
			<button @click="building.meta = building.meta.sub(1).min(maxPow).max(0)" :class="{
				'single-button': true,
				'locked': building.meta.lte(0)
			}" v-if="Research.has('clearing', 1)">-</button>
			<span style="vertical-align: middle;">Clearing power: {{format(Decimal.pow(2, building.meta), 0)}} |
			<span class="curr shards">_</span> usage:
			{{format(Decimal.pow(2, building.meta).mul(BUILDINGS[SPECIAL_CHARS.theta].shardUsage), 1)}}/s</span>
			<button @click="building.meta = building.meta.add(1).min(maxPow).max(0)" :class="{
				'single-button': true,
				'locked': building.meta.gte(maxPow)
			}" v-if="Research.has('clearing', 1)">+</button>
			<br>
			(0 <span class="curr shards">_</span> usage if no unexplored tile in range)
			<br><br><br><br>
			<button @click="Building.sell(data.x, data.y, SPECIAL_CHARS.theta)">Sell for 80% of original price</button>
		</div>`
	})
	Vue.component('sectorclearer-menu', {
		props: ["data"],
		data: () => { return {
			player,
			Research,
			BUILDINGS,
			SPECIAL_CHARS,
			Building,
			Decimal
		}},
		methods: {
			format
		},
		computed: {
			building() {
				return Building.getByPos(this.data.x, this.data.y, SPECIAL_CHARS.slashO);
			},
			maxPow() {
				let pow = 8;

				return pow;
			}
		},
		template: `<div style='padding: 10px; position: relative;'>
			<h1>Sector clearer</h1>
			Stats:<br>
			<button @click="building.meta.power = building.meta.power.sub(1).min(maxPow).max(0)" :class="{
				'single-button': true,
				'locked': building.meta.power.lte(0)
			}" v-if="Research.has('clearing', 1)">-</button>
			<span style="vertical-align: middle;">Clearing power: {{format(Decimal.pow(2, building.meta.power), 0)}} |
			<span class="curr shards">_</span> usage:
			{{format(Decimal.pow(2, building.meta.power).mul(BUILDINGS[SPECIAL_CHARS.slashO].shardUsage), 1)}}/s</span>
			<button @click="building.meta.power = building.meta.power.add(1).min(maxPow).max(0)" :class="{
				'single-button': true,
				'locked': building.meta.power.gte(maxPow)
			}" v-if="Research.has('clearing', 1)">+</button>
			<br>
			(0 <span class="curr shards">_</span> usage if no unexplored tile in range)
			<br><br><br><br>
			<button @click="Building.sell(data.x, data.y, SPECIAL_CHARS.slashO)">Sell for 80% of original price</button>

			<div style="position: absolute; top: 10px; right: 10px;">
				<div style="display: flex;">
					<div :class="{'sector-select': true, selected: building.meta.preset == 2}"
					style="border-radius: 50px 0 0 0"
					@click="building.meta.preset = 2;"></div>
					<div :class="{'sector-select': true, selected: building.meta.preset == 1}"
					style="border-radius: 0 50px 0 0"
					@click="building.meta.preset = 1;"></div>
				</div>
				<div style="display: flex;">
					<div :class="{'sector-select': true, selected: building.meta.preset == 3}"
					style="border-radius: 0 0 0 50px"
					@click="building.meta.preset = 3;"></div>
					<div :class="{'sector-select': true, selected: building.meta.preset == 4}"
					style="border-radius: 0 0 50px 0"
					@click="building.meta.preset = 4;"></div>
				</div>
			</div>
		</div>`
	})

	Vue.component('torch-menu', {
		props: ["data"],
		data: () => { return {
			Building
		}},
		template: `<div style='padding: 10px;'>
			<h1>Torch</h1>
			<br><br><br><br>
			<button @click="Building.sell(data.x, data.y, 'i')">Sell for 80% of original price</button>
		</div>`
	})
}

let accessData = {
	usable: [SPECIAL_CHARS.tri, 'V', SPECIAL_CHARS.house, 'x', SPECIAL_CHARS.dia, SPECIAL_CHARS.shrine,
	SPECIAL_CHARS.theta, SPECIAL_CHARS.slashO, 'i'],
	tiles: []
}
function openMenu(x, y) {
	let tileName = map[x][y][0];
	if (player.buildings[tileName] && !Building.getByPos(x, y, map[x][y][0])) {
		map[x][y][0] = getMapEmpty(x, y);
		return;
	}
	let name = MENU_DATA[tileName].name ?? tileName;
	Modal.show({
		title: '<span style="font-size: 35px; color: ' + tileStyle[tileName] + ';">' + name + '</span>',
		bind: MENU_NAMES[tileName] + '-menu',
		bindData: {x, y, tile: map[x][y]},
		style: MENU_DATA[tileName].style ?? {}
	})
}

const MENU_NAMES = {
	[SPECIAL_CHARS.dia]: 'crystal',
	[SPECIAL_CHARS.tri]: 'drillv1',
	V: 'drillv2',
	x: 'trap',
	[SPECIAL_CHARS.shrine]: 'shrine',
	[SPECIAL_CHARS.theta]: 'areaclearer',
	[SPECIAL_CHARS.slashO]: 'sectorclearer',
	[SPECIAL_CHARS.house]: 'research',
	i: 'torch'
}
const MENU_DATA = {
	[SPECIAL_CHARS.dia]: {
		name: 'Construction firm',
		style: {
			width: '700px',
			height: '500px'
		}
	},
	[SPECIAL_CHARS.house]: {
		name: 'Laboratory',
		style: {
			width: '700px',
			height: '500px'
		}
	},
	[SPECIAL_CHARS.tri]: {},
	V: {},
	x: {},
	[SPECIAL_CHARS.shrine]: {},
	[SPECIAL_CHARS.theta]: {},
	[SPECIAL_CHARS.slashO]: {},
	i: {}
}
