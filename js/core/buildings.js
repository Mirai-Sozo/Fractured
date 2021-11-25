/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-tabs */
"use strict";
const BUILDINGS = {
  [SPECIAL_CHARS.tri]: {
    get cost() {
      return player.buildingAmt[SPECIAL_CHARS.tri].pow(1.7).mul(1.7).add(20).round();
    },
    power: D(0),
    currencyDisplayName: "_",
    currencyInternalName: "shards",
    desc: `Produces a small amount of <span class="curr shards">_</span>`,
    name: "Drill v1",
    get subConstant() {
      return Research.has("drilling", 1) ? 9.998e6 : 9.999e6;
    },
    get usageDiv() {
      let usage = 1;
      if (Magic.Enchants.has("n1")) usage *= 50;
      return usage;
    },
    getMult(b) {
      let mult;
      if (!Research.has("drilling", 2)) mult = 1;
      else if (isNaN(parseInt(noiseMap[b.pos.x][b.pos.y][0], 10))) mult = 1;
      else if (noiseMap[b.pos.x][b.pos.y][0] < 2) mult = 1;
      else mult = 3;

      for (const shrine of player.buildings[SPECIAL_CHARS.shrine]) {
        if (distGrid([b.pos.x, b.pos.y], [shrine.pos.x, shrine.pos.y]) < 3) {
          mult *= 1.5;
          if (Research.has("trapping", 3) && player.currency.food.gte(5000)) mult *= 2;
          break;
        }
      }

      return mult;
    },
    getProduction(b) {
      return map[b.pos.x][b.pos.y][1]
        .sub(this.subConstant)
        .pow(1 / 3)
        .mul(0.1)
        .mul(Research.has("drilling", 1) ? 2 : 1);
    },
    canPlace(x, y) {
      return checkTileAccess(x, y) && player.currency.shards.gte(this.cost);
    },
    startMeta(x, y) {
      return map[x][y][1].sub(this.subConstant).max(0);
    }
  },
  V: {
    get cost() {
      return player.buildingAmt.V.pow(1.8).mul(20).add(200).round();
    },
    power: D(0),
    currencyDisplayName: "_",
    currencyInternalName: "shards",
    desc: `Produces a considerable amount of <span class="curr shards">_</span>`,
    name: "Drill v2",
    get subConstant() {
      return 9.98e6;
    },
    get usageDiv() {
      let usage = 1;
      if (Magic.Enchants.has("n1")) usage *= 50;
      return usage;
    },
    getMult(b) {
      let mult;
      if (!Research.has("drilling", 2)) mult = 2;
      else if (isNaN(parseInt(noiseMap[b.pos.x][b.pos.y][0], 10))) mult = 2;
      else if (noiseMap[b.pos.x][b.pos.y][0] < 2) mult = 2;
      else mult = 6;

      for (const shrine of player.buildings[SPECIAL_CHARS.shrine]) {
        if (distGrid([b.pos.x, b.pos.y], [shrine.pos.x, shrine.pos.y]) < 3) {
          mult *= 1.5;
          if (Research.has("trapping", 3) && player.currency.food.gte(5000)) mult *= 2;
          break;
        }
      }

      return mult;
    },
    getProduction(b) {
      return map[b.pos.x][b.pos.y][1].sub(this.subConstant).pow(1 / 3).mul(1 / 3);
    },
    canPlace(x, y) {
      return checkTileAccess(x, y) && player.currency.shards.gte(this.cost);
    },
    startMeta(x, y) {
      return map[x][y][1].sub(this.subConstant).max(0);
    }
  },
  x: {
    get cost() {
      return player.buildingAmt.x.pow(1.7).mul(5).add(100).round();
    },
    power: D(0),
    currencyDisplayName: "_",
    currencyInternalName: "shards",
    get desc() {
      return `Has a 10% chance of catching an animal each second<br>
        <i class="sub">Can only be placed on <span style="color: #44bb22">^</span>,
        uses ${format(BUILDINGS.x.shardUsage)} <span class="curr shards">_</span> for each capture<br></i>`;
    },
    name: "Trap",
    get shardUsage() {
      let usage = 10;
      if (Magic.Enchants.has("n2")) usage = 1;
      return usage;
    },
    canPlace(x, y) {
      return map[x][y][0] === "^" && player.currency.shards.gte(this.cost);
    },
    startMeta(x, y) {
      return {
        active: true,
        food: D(0)
      };
    },
    collect(b) {
      const transfer = D(150).sub(player.attributes.food).min(b.meta.food);
      player.attributes.food = player.attributes.food.add(transfer);
      b.meta.food = b.meta.food.sub(transfer);
      if (Research.has("trapping", 1)) {
        player.currency.food = player.currency.food.add(b.meta.food);
        b.meta.food = D(0);
      }
    }
  },
  [SPECIAL_CHARS.shrine]: {
    get cost() {
      return player.buildingAmt[SPECIAL_CHARS.shrine].pow(2).mul(15).add(1000).round();
    },
    power: D(0),
    currencyDisplayName: SPECIAL_CHARS.meat,
    currencyInternalName: "food",
    desc: `Drills in a 5x5 area produce x1.5 the <span class="curr shards">_</span> from the same reserves.<br>
      <i class="sub">No, they don't stack.</i>`,
    name: "Shrine",
    canPlace(x, y) {
      return checkTileAccess(x, y) && player.currency.food.gte(this.cost);
    },
    startMeta(_x, _y) {
      return {};
    }
  },
  [SPECIAL_CHARS.lure]: {
    get cost() {
      return player.buildingAmt[SPECIAL_CHARS.lure].pow(1.8).mul(30).add(700).round();
    },
    power: D(0),
    currencyDisplayName: SPECIAL_CHARS.meat,
    currencyInternalName: "food",
    desc: `Traps in a 5x5 area have a 20% chance of capturing instead of 10%.<br>
      <i class="sub">They don't stack either.</i>`,
    name: "Lure",
    canPlace(x, y) {
      return checkTileAccess(x, y) && player.currency.food.gte(this.cost);
    },
    startMeta(_x, _y) {
      return {};
    }
  },
  [SPECIAL_CHARS.theta]: {
    get cost() {
      return player.buildingAmt[SPECIAL_CHARS.theta].pow(1.8).mul(10).add(150).round();
    },
    get shardUsage() {
      let usage = 3;
      if (Research.has("clearing", 2)) usage /= 2;

      return usage;
    },
    power: D(5),
    currencyDisplayName: "_",
    currencyInternalName: "shards",
    get desc() {
      const area = Research.has("clearing", 1) ? "9" : "7";
      return `Clears unexplored tiles in a <b>${area}x${area}</b> area<br>
      <i class="sub">Uses <span class="curr shards">_</span> when clearing tiles</i>`;
    },
    name: "Area clearer",
    canPlace(x, y) {
      return checkTileAccess(x, y) && player.currency.shards.gte(this.cost);
    },
    startMeta(_x, _y) {
      return D(0);
    }
  },
  [SPECIAL_CHARS.slashO]: {
    get cost() {
      return player.buildingAmt[SPECIAL_CHARS.slashO].pow(1.9).mul(200).add(10000).round();
    },
    get shardUsage() {
      const usage = 10;

      return usage;
    },
    power: D(50),
    currencyDisplayName: "_",
    currencyInternalName: "shards",
    get desc() {
      return `Clears unexplored tiles in a sector<br>
      <i class="sub">You can change the angle in the menu</i>`;
    },
    name: "Sector clearer",
    canPlace(x, y) {
      return checkTileAccess(x, y) && player.currency.shards.gte(this.cost);
    },
    startMeta(_x, _y) {
      return {
        power: D(0),
        preset: 1
      };
    }
  },
  i: {
    cost: D(50),
    power: D(0),
    currencyDisplayName: "_",
    currencyInternalName: "shards",
    desc: "Lights up a small area.",
    name: "Torch",
    canPlace(x, y) {
      return checkTileAccess(x, y) && player.currency.shards.gte(this.cost);
    },
    startMeta(_x, _y) {
      return D(0);
    }
  }
};

const placeData = {
  facing: 0,
  nodeType: "tile",
  node: ""
};

const Building = {
  startPlacing(id, type) {
    const building = BUILDINGS[id];
    if (building.cost.gt(player.currency[building.currencyInternalName])) return;
    if (player.attributes.powerUsed.add(building.power).gt(player.attributes.power)) return;
    Modal.close();

    if (!player.loreUnlocks.place) {
      Modal.show({
        title: "Placing buildings",
        text: `<br><br>
        Use wasd to move around as normal, and shift+wasd to rotate the building in its place.<br>
        Press space to place the building, and esc to cancel.`,
        // eslint-disable-next-line no-empty-function
        close() {}
      });
      setTimeout(() => {
        Modal.show({
          title: "Placing buildings",
          text: `<br><br>
          Use wasd to move around as normal, and shift+wasd to rotate the building in your place.<br>
          Press space to place the building, and esc to cancel.`,
          buttons: [{
            text: "Close",
            onClick() { Modal.close(); }
          }]
        });
      }, 1000);
      player.loreUnlocks.place = true;
    }
    placeData.nodeType = type;
    placeData.node = id;
    renderLayer1();
    if (Research.has("access", 2)) canvas.need0update = true;
  },
  stopPlacing() {
    if (!placeData.node) return;
    const b = BUILDINGS[placeData.node];
    const [x, y] = getXYfromDir(placeData.facing);

    if (!b.canPlace(x, y)) return;

    if (b.onPlace) b.onPlace(x, y);

    player.currency[b.currencyInternalName] = player.currency[b.currencyInternalName].sub(b.cost);
    player.attributes.powerUsed = player.attributes.powerUsed.add(b.power);
    if (b.givePower) player.attributes.power = player.attributes.power.add(b.givePower);

    player.buildingAmt[placeData.node] = player.buildingAmt[placeData.node].add(1);
    player.buildings[placeData.node].push({ pos: { x, y }, meta: b.startMeta(x, y) });
    if (placeData.nodeType === "tile") {
      map[x][y][0] = placeData.node;
    }
    if (!player.options.buildMultiple) placeData.node = "";
    render();
    renderLayer1();
    updateTileUsage();
  },
  sell(x, y, type) {
    Modal.close();
    const b = BUILDINGS[type];
    if (b.onSell) b.onSell(x, y);

    player.buildings[type].splice(Building.getByPos(x, y, type, true), 1);
    player.buildingAmt[type] = player.buildingAmt[type].sub(1);
    player.currency[b.currencyInternalName] = player.currency[b.currencyInternalName].add(b.cost.mul(0.8));
    player.attributes.powerUsed = player.attributes.powerUsed.sub(b.power);
    if (b.givePower) player.attributes.power = player.attributes.power.sub(b.givePower);
    map[x][y][0] = getMapEmpty(x, y);
    canvas.need0update = true;
    updateTileUsage();
  },
  getByPos(x, y, type, id = false) {
    if (id) {
      for (const i in player.buildings[type]) {
        if (player.buildings[type][i].pos.x === x && player.buildings[type][i].pos.y === y) return i;
      }
    }
    for (const i of player.buildings[type]) {
      if (i.pos.x === x && i.pos.y === y) return i;
    }
    return -1;
  },
  load() {
    Vue.component("building-ui", {
      props: ["bId", "type"],
      data: () => ({
        player,
        BUILDINGS,
        SPECIAL_CHARS,
        tileStyle,
        format,
        Building
      }),
      computed: {
        building() {
          return BUILDINGS[this.bId];
        }
      },
      template: `<div :class="{
        'building-segment': true,
        'locked': player.currency[building.currencyInternalName].lt(building.cost) ||
        player.attributes.powerUsed.add(building.power).gt(player.attributes.power)
      }" @click="Building.startPlacing(bId, type)">
        <span style="width: 50px;">
          &nbsp;
          <span :style="{color: tileStyle[bId]}" class="buildingImg">{{bId}}</span>
          &nbsp;
        </span>
        <span v-html="building.name + ': ' + building.desc" style="width: 600px; font-size: 16px; text-align: left;"></span>
        <span style="width: 90px; font-size: 18px;">
          <div style="margin-left: 5px; text-align: left;">
            {{format(building.cost, 0)}}
            <span :class="{curr: true, [building.currencyInternalName]: true}">
              {{building.currencyDisplayName}}
            </span>
            <div v-if="building.power.gt(0)">
              <span class="mid">{{format(building.power, 0)}}</span> <span class="curr power"></span>
            </div>
          </div>
        </span>
      </div>`
    });
  }
};