"use strict";
function getStartPlayer() {
  return {
    loreUnlocks: {
      start: false,
      place: false,
      village: false,
      highestCleared: 0
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
      shards: D(20),
      food: D(0),
      magic: D(0)
    },
    attributes: {
      health: D(100),
      food: D(100),
      power: D(250),
      powerUsed: D(0)
    },
    buildingAmt: {
      [SPECIAL_CHARS.tri]: D(0),
      V: D(0),
      x: D(0),
      [SPECIAL_CHARS.shrine]: D(0),
      [SPECIAL_CHARS.lure]: D(0),
      [SPECIAL_CHARS.theta]: D(0),
      [SPECIAL_CHARS.slashO]: D(0),
      i: D(0)
    },
    buildings: {
      [SPECIAL_CHARS.tri]: [],
      V: [],
      x: [],
      [SPECIAL_CHARS.shrine]: [],
      [SPECIAL_CHARS.lure]: [],
      [SPECIAL_CHARS.theta]: [],
      [SPECIAL_CHARS.slashO]: [],
      i: []
    },
    research: {
      drilling: 0,
      clearing: 0,
      access: 0,
      trapping: 0,
      magic: 0,
    },
    enchants: [],
    spells: {
      temporal: {
        time: 0
      },
      artemis: {
        time: 0
      },
      power: {
        time: 0
      }
    },
    options: {
      autosave: true,
      showTilePopups: true,
      showTileU: true,
      buildMultiple: false
    }
  };
}
const saveKey = "IGJsummer-IGJ2021-Scarlet";
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
  for (const i in initData) {
    const initProp = initData[i];

    if (data[i] === undefined || (data[i].constructor !== initProp.constructor && !(initProp instanceof Decimal)))
      data[i] = initProp;

    if (initProp.constructor === Object || Array.isArray(initProp)) 
      deepSaveParse(data[i], initProp);
    else if (typeof initProp === "object")
      data[i] = new initProp.constructor(data[i]);
  }
}

function deepDecimalise(data) {
  for (const i in data) {
    const prop = data[i];
    
    if (prop.constructor === Object || Array.isArray(prop)) {
      deepDecimalise(data[i]);
    } else if (typeof data[i] === "string") {
      try {
        if (D(data[i]).m !== "NaN" && D(data[i]).e !== "NaN") data[i] = D(data[i]);
      } catch (e) {
        // Nothing
      }
    }
  }
}