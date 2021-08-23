function getStartPlayer() {
	return {
		loreUnlocks: {
			start: false,
			place: false
		},
		pos: {
			x: 351,
			y: 350
		},
		map: 0,
		time: {
			thisTick: new Date().getTime(),
			timeStat: 0
		},
		currency: {
			shards: D(20)
		},
		attributes: {
			health: D(100),
			food: D(100),
			power: D(250),
			powerUsed: D(0)
		},
		buildingAmt: {
			[SPECIAL_CHARS.tri]: D(0),
			x: D(0),
			[SPECIAL_CHARS.theta]: D(0)
		},
		buildings: {
			[SPECIAL_CHARS.tri]: [],
			x: [],
			[SPECIAL_CHARS.theta]: []
		},
		research: {
			drilling: 0,
			clearing: 0
		},
		options: {
			autosave: true,
			showTilePopups: true,
			showTileU: true
		}
	};
}
let saveKey = "IGJsummer-IGJ2021-ScarletDys";
let player;

function loadPlayer() {
	player = getStartPlayer();
	if (localStorage.getItem(saveKey)) {
		player = JSON.parse(localStorage.getItem(saveKey));
		deepSaveParse(player, getStartPlayer());
		deepDecimalise(player);
	}
}

function deepSaveParse(data, initData) {
	for (let i in initData) {
		let initProp = initData[i];

		if (data[i] == undefined || (data[i].constructor != initProp.constructor && !initProp instanceof Decimal))
			data[i] = initProp;

		if (initProp.constructor == Object || Array.isArray(initProp)) 
			deepSaveParse(data[i], initProp);
		else if (typeof initProp == "object")
			data[i] = new initProp.constructor(data[i]);
	}
}

function deepDecimalise(data) {
	for (let i in data) {
		let prop = data[i];
		
		if (prop.constructor == Object || Array.isArray(prop)) {
			deepDecimalise(data[i]);
		}
		else if (typeof data[i] == "string") {
			try {
				if (D(data[i]).m != "NaN" && D(data[i]).e != "NaN") data[i] = D(data[i])
			} catch {
				//nothing
			}
		}
	}
}