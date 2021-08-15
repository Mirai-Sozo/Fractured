function getStartPlayer() {
	return {
		time: {
			thisTick: new Date().getTime(),
			timeStat: 0
		}
	};
}
let saveKey = "IGJsummer-IGJ2021-ScarletDys"
let player;

function loadPlayer() {
	player = getStartPlayer();
	if (localStorage.getItem(saveKey)) {
		player = JSON.parse(localStorage.getItem(saveKey));
		deepSaveParse(player, getStartPlayer());
	}
}

function deepSaveParse(data, initData) {
	for (let i in initData) {
		let initProp = initData[i];

		if (data[i] == undefined || (data[i].constructor != initProp.constructor && !initProp instanceof Decimal)) data[i] = initProp;

		if (initProp.constructor == Object || Array.isArray(initProp)) deepSaveParse(data[i], initProp);
		else if (typeof initProp == "object") data[i] = new initProp.constructor(data[i]);
	}
}