function loadMenus() {
	Vue.component('crystal-menu', {
		data: () => { return {
			player,
			format,
			SPECIAL_CHARS
		}},
		template: `<div style='text-align: center; overflow-y: auto;'>
			<building-ui :bId="SPECIAL_CHARS.tri" type="tile"></building-ui>
			<building-ui :bId="'x'" type="tile"></building-ui>
			<building-ui :bId="SPECIAL_CHARS.theta" type="tile"></building-ui>
		</div>`
	})
	loadBuildings();

	Vue.component('drillv1-menu', {
		props: ["data"],
		data: () => { return {
			BUILDINGS,
			SPECIAL_CHARS
		}},
		methods: {
			format,
			getBuildingWPos,
			sell
		},
		template: `<div style='padding: 10px;'>
			<h1>Drill V1</h1>
			Stats:<br>
			{{format(BUILDINGS[SPECIAL_CHARS.tri].getProduction(getBuildingWPos(data.x, data.y, SPECIAL_CHARS.tri)))}}
			<span class="curr shards">_</span>/s
			<br>
			Reserves:
			{{format(getBuildingWPos(data.x, data.y, SPECIAL_CHARS.tri).meta, 0)}}/1000 <span class="curr shards">_</span>
			<br><br><br><br>
			<button @click="sell(data.x, data.y, SPECIAL_CHARS.tri)">Sell for 80% of original price</button>
		</div>`
	})

	Vue.component('trap-menu', {
		props: ["data"],
		data: () => { return {
			BUILDINGS,
			SPECIAL_CHARS
		}},
		methods: {
			format,
			getBuildingWPos,
			sell,
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
				return getBuildingWPos(this.data.x, this.data.y, 'x')
			}
		},
		template: `<div style='padding: 10px;'>
			<h1>Trap</h1>
			Stats:<br>
			5% chance of capture/s, <span class="curr meat">{{SPECIAL_CHARS.meat}}</span> food/capture
			<br>
			-10 <span class="curr shards">_</span>/capture
			<br>
			Reserves:
			{{format(building.meta.food, 0)}} <span class="curr meat">{{SPECIAL_CHARS.meat}}</span>
			<br><br>
			<button @click="collect()">Collect</button>
			<br><br>
			<button @click="toggleActive()">{{building.meta.active ? "Deactivate" : "Activate"}} trap</button>
			<br><br><br><br>
			<button @click="sell(data.x, data.y, SPECIAL_CHARS.tri)">Sell for 80% of original price</button>
		</div>`
	})

	Vue.component('areaclearer-menu', {
		props: ["data"],
		data: () => { return {
			BUILDINGS,
			SPECIAL_CHARS
		}},
		methods: {
			format,
			getBuildingWPos,
			sell
		},
		template: `<div style='padding: 10px;'>
			<h1>Area clearer</h1>
			Stats:<br>
			-1.5 <span class="curr shards">_</span>/s
			<br>
			<br><br><br><br>
			<button @click="sell(data.x, data.y, SPECIAL_CHARS.theta)">Sell for 80% of original price</button>
		</div>`
	})
}

let accessData = {
	usable: [SPECIAL_CHARS.tri, 'x', SPECIAL_CHARS.dia, SPECIAL_CHARS.theta],
	tiles: []
}
function openMenu(x, y) {
	let tileName = map[x][y][0];
	let name = MENU_DATA[tileName].name ?? tileName
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
	[SPECIAL_CHARS.theta]: 'areaclearer'
}
const MENU_DATA = {
	[SPECIAL_CHARS.dia]: {
		name: 'Construction firm',
		style: {
			width: '700px',
			height: '500px'
		}
	},
	[SPECIAL_CHARS.tri]: {},
	x: {},
	[SPECIAL_CHARS.theta]: {}
}