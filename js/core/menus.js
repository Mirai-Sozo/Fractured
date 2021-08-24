function loadMenus() {
	Vue.component('crystal-menu', {
		data: () => { return {
			player,
			SPECIAL_CHARS
		}},
		template: `<div style='text-align: center; overflow-y: auto;'>
			<building-ui :bId="SPECIAL_CHARS.tri" type="tile"></building-ui>
			<building-ui :bId="'x'" type="tile"></building-ui>
			<building-ui :bId="SPECIAL_CHARS.theta" type="tile"></building-ui>
		</div>`
	})
	Vue.component('research-menu', {
		data: () => { return {
			player
		}},
		template: `<div style='text-align: center; overflow-y: auto;'>
			<research-ui :rId="'drilling'"></research-ui>
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

	Vue.component('trap-menu', {
		props: ["data"],
		data: () => { return {
			BUILDINGS,
			SPECIAL_CHARS,
			Building
		}},
		methods: {
			format,
			collect() {
				let transfer = D(150).sub(player.attributes.food).min(this.building.meta.food);
				player.attributes.food = player.attributes.food.add(transfer);
				this.building.meta.food = this.building.meta.food.sub(transfer);
			},
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
			5% chance of capture/s, 15 <span class="curr meat">{{SPECIAL_CHARS.meat}}</span>/capture | 
			-10 <span class="curr shards">_</span>/capture
			<br>
			Reserves:
			{{format(building.meta.food, 0)}} <span class="curr meat">{{SPECIAL_CHARS.meat}}</span>
			<br><br>
			<button @click="collect()">Collect</button>
			<br><br>
			<button @click="toggleActive()">{{building.meta.active ? "Deactivate" : "Activate"}} trap</button>
			<br><br><br><br>
			<button @click="Building.sell(data.x, data.y, 'x')">Sell for 80% of original price</button>
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
			<span style="vertical-align: middle;">Clearing power: {{format(Decimal.pow(2, building.meta))}} |
			<span class="curr shards">_</span> usage: {{format(Decimal.pow(2, building.meta).mul(BUILDINGS[SPECIAL_CHARS.theta].shardUsage))}}/s</span>
			<button @click="building.meta = building.meta.add(1).min(maxPow).max(0)" :class="{
				'single-button': true,
				'locked': building.meta.gte(maxPow)
			}" v-if="Research.has('clearing', 1)">+</button>
			<br>
			(0 <span class="curr shards">_</span> usage if no unexplored tile in vicinity)
			<br><br><br><br>
			<button @click="Building.sell(data.x, data.y, SPECIAL_CHARS.theta)">Sell for 80% of original price</button>
		</div>`
	})
}

let accessData = {
	usable: [SPECIAL_CHARS.tri, SPECIAL_CHARS.house, 'x', SPECIAL_CHARS.dia, SPECIAL_CHARS.theta],
	tiles: []
}
function openMenu(x, y) {
	let tileName = map[x][y][0];
	if (player.buildings[tileName] && !Building.getByPos(x, y, map[x][y][0]))
		map[x][y][0] = getMapEmpty(x, y);
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
	x: 'trap',
	[SPECIAL_CHARS.theta]: 'areaclearer',
	[SPECIAL_CHARS.house]: 'research'
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
	x: {
		name: "Trap"
	},
	[SPECIAL_CHARS.theta]: {},
}
