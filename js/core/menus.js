"use strict";
function loadMenus() {
  Vue.component("crystal-menu", {
    data: () => ({
      player,
      Research,
      SPECIAL_CHARS
    }),
    template: `<div style='text-align: center; overflow-y: auto; height: 452px;'>
      <div style="text-align: left;">
        <button style="height: 35px; margin: 6px;"
        @click="player.options.buildMultiple = !player.options.buildMultiple">
          Build multiple buildings in one go: {{player.options.buildMultiple ? "ON" : "OFF"}}
        </button>
      </div>
      <building-ui :bId="SPECIAL_CHARS.tri" type="tile" style="border-top: 2px dashed var(--c2);"></building-ui>
      <building-ui :bId="'V'" type="tile" v-if="Research.has('drilling', 3)"></building-ui>
      <building-ui :bId="'x'" type="tile"></building-ui>
      <building-ui :bId="SPECIAL_CHARS.shrine" type="tile" v-if="Research.has('trapping', 1)"></building-ui>
      <building-ui :bId="SPECIAL_CHARS.lure" type="tile" v-if="Research.has('trapping', 4)"></building-ui>
      <building-ui :bId="SPECIAL_CHARS.theta" type="tile"></building-ui>
      <building-ui :bId="SPECIAL_CHARS.slashO" v-if="Research.has('clearing', 3)" type="tile"></building-ui>
      <div class="building-segment" style="height: 80px; cursor: default;"></div>
      <building-ui :bId="'i'" type="tile" style="position: fixed; bottom: 0; width: 750px;
      background-color: var(--bg1); border-top: 2px dashed var(--c2)"></building-ui>
    </div>`
  });
  Vue.component("research-menu", {
    data: () => ({
      player,
      tab: "Purchases",
      listTab: "drilling"
    }),
    template: `<div style='height: 452px;'>
      <div style="display: flex; height: 30px; align-items: flex-stretch;">
        <button :style="{
          width: '50.1%',
          border: '2px solid #fff',
          'margin-left': '-0.1px',
          color: tab == 'Purchases' ? '#fff8' : '#fff'
        }" @click="tab = 'Purchases'">
          Purchases
        </button>
        <button :style="{
          width: '50.1%',
          border: '2px solid #fff',
          color: tab == 'List' ? '#fff8' : '#fff'
        }" @click="tab = 'List'">
          List of researches
        </button>
      </div>
      <div style="text-align: center; overflow-y: auto; height: 422px;" v-if="tab == 'Purchases'">
        <research-ui :rId="'drilling'"></research-ui>
        <research-ui :rId="'trapping'"></research-ui>
        <research-ui :rId="'clearing'"></research-ui>
        <research-ui :rId="'access'"></research-ui>
        <research-ui :rId="'magic'" v-if="player.loreUnlocks.village"></research-ui>
      </div>
      <div style="height: 422px; display: flex;" v-else>
        <div style="width: 138px; border-right: 2px solid; display: inline-block">
          <button style="width: 100%; height: 30px;"
          :class="{
            locked: listTab == 'drilling'
          }" @click="listTab = 'drilling'">Drilling</button>
          <button style="width: 100%; height: 30px;"
          :class="{
            locked: listTab == 'trapping'
          }" @click="listTab = 'trapping'">Trapping</button>
          <button style="width: 100%; height: 30px;"
          :class="{
            locked: listTab == 'clearing'
          }" @click="listTab = 'clearing'">Clearing</button>
          <button style="width: 100%; height: 30px;"
          :class="{
            locked: listTab == 'access'
          }" @click="listTab = 'access'">Access</button>
          <button style="width: 100%; height: 30px;"
          :class="{
            locked: listTab == 'magic'
          }" @click="listTab = 'magic'" v-if="player.loreUnlocks.village">Magick</button>
        </div>
        <research-list :rId="listTab"/>
      </div>
    </div>`
  });
  Vue.component("village-menu", {
    data: () => ({
      player,
      SPECIAL_CHARS,
      tradeAmt: 0.1,
      tab: "enchants"
    }),
    methods: {
      trade(amt) {
        const tradeRatio = this.tradeRatio;
        if (player.currency.food.lt(tradeRatio)) return;
        const transfer = player.currency.food.mul(amt).div(tradeRatio).floor();
        player.currency.magic = player.currency.magic.add(transfer);
        player.currency.food = player.currency.food.sub(transfer.mul(tradeRatio));
      },
      format
    },
    computed: {
      tradeRatio() {
        let rate = 1e3;
        if (Research.has("magic", 1)) rate = 750;
        return rate;
      }
    },
    template: `<div style='text-align: center; overflow-y: auto; height: 552px;'>
      <h1>Trade</h1>
      <div style='text-align: center; position: relative;'>
        <span style="font-size: 20px; position: absolute; right: 120px; top: 5px">
          {{format(player.currency.magic, 0)}} <span class="curr magic">*</span>
        </span>
        <div style='position: absolute; left: 10px;'>
          <button :class="{
            'med-button': true,
            locked: tradeAmt == 0.1
          }" @click="tradeAmt = 0.1">10%</button>
          <button :class="{
            'med-button': true,
            locked: tradeAmt == 0.2
          }" @click="tradeAmt = 0.2">20%</button>
          <button :class="{
            'med-button': true,
            locked: tradeAmt == 0.5
          }" @click="tradeAmt = 0.5">50%</button>
          <button :class="{
            'med-button': true,
            locked: tradeAmt == 1
          }" @click="tradeAmt = 1">100%</button>
        </div>
        <button style="font-size: 20px; padding: 6px;" @click="trade(tradeAmt)">
          {{format(player.currency.food.mul(tradeAmt).div(tradeRatio).floor().mul(tradeRatio), 0)}}
          <span class="curr food">{{SPECIAL_CHARS.meat}}</span>
          ->
          {{format(player.currency.food.mul(tradeAmt).div(tradeRatio).floor(), 0)}}
          <span class="curr magic">*</span>
        </button>


        <br><br><div style="height: 2px; background-color: var(--c1)"></div><br>
        <button style="font-size: 20px;" @click="tab = 'enchants'" :class="{
          locked: tab == 'enchants'
        }">Enchants</button>
        <button style="font-size: 20px;" @click="tab = 'spells'" :class="{
          locked: tab == 'spells'
        }">Spells</button>
        <br><br>

        <div v-if="tab == 'enchants'">
          <div style="display: flex; justify-content: center;">
            <enchant :eId="'n1'"></enchant>
            <enchant :eId="'n2'"></enchant>
          </div>
          <div style="display: flex; justify-content: center;">
            <enchant :eId="'l1'"></enchant>
            <enchant :eId="'l2'"></enchant>
          </div>
        </div>
        <div v-if="tab == 'spells'">
          <div style="display: flex; justify-content: center;">
            <spell :sId="'temporal'"></spell>
            <spell :sId="'artemis'"></spell>
            <spell :sId="'power'"></spell>
          </div>
        </div>
      </div>
    </div>`
  });
  Building.load();
  Research.load();
  Magic.Enchants.load();
  Magic.Spells.load();

  Vue.component("drillv1-menu", {
    props: ["data"],
    data: () => ({
      Research,
      player,
      BUILDINGS,
      SPECIAL_CHARS,
      Building
    }),
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
      {{format(BUILDINGS[SPECIAL_CHARS.tri]
        .getProduction(building)
        .mul(BUILDINGS[SPECIAL_CHARS.tri].getMult(building)))}}
      <span class="curr shards">_</span>/s
      <br>
      Reserves:
      {{format(building.meta, 0)}}/{{Research.has('drilling', 1) ? "2000" : "1000"}} <span class="curr shards">_</span>
      <br><br><br><br>
      <button @click="Building.sell(data.x, data.y, SPECIAL_CHARS.tri)">Sell for 80% of original price</button>
    </div>`
  });
  Vue.component("drillv2-menu", {
    props: ["data"],
    data: () => ({
      Research,
      player,
      BUILDINGS,
      SPECIAL_CHARS,
      Building
    }),
    methods: {
      format
    },
    computed: {
      building() {
        return Building.getByPos(this.data.x, this.data.y, "V");
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
  });

  Vue.component("trap-menu", {
    props: ["data"],
    data: () => ({
      BUILDINGS,
      SPECIAL_CHARS,
      Building,
      Magic
    }),
    methods: {
      format,
      collect: BUILDINGS.x.collect,
      toggleActive() {
        this.building.meta.active = !this.building.meta.active;
        canvas.need0update = true;
      }
    },
    computed: {
      building() {
        return Building.getByPos(this.data.x, this.data.y, "x");
      },
      hasLure() {
        for (const b of player.buildings[SPECIAL_CHARS.lure]) {
          if (distGrid([this.data.x, this.data.y], [b.pos.x, b.pos.y]) < 3) return true;
        }
        return false;
      }
    },
    template: `<div style='padding: 10px;'>
      <h1>Trap ({{building.meta.active ? "ACTIVE" : "INACTIVE"}})</h1>
      Stats:<br>
      {{hasLure ? "20" : "10"}}% chance of capture/s, {{(Magic.Spells.has("artemis") ? 40 : 15)}} 
        <span class="curr food">{{SPECIAL_CHARS.meat}}</span>/capture | 
      -{{format(BUILDINGS.x.shardUsage, 0)}} <span class="curr shards">_</span>/capture
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
  });
  Vue.component("shrine-menu", {
    props: ["data"],
    data: () => ({
      SPECIAL_CHARS,
      Building,
      Research,
      player
    }),
    template: `<div style='padding: 10px;'>
      <h1>Shrine</h1>
      <span v-if="Research.has('trapping', 3)">Stats:<br>
      {{player.currency.food.gte(5000) ? "x3" : "x1.5"}} Drill production in a 5x5 area |
      -30 <span class="curr food">{{SPECIAL_CHARS.meat}}</span>/s</span>
      <br><br><br><br>
      <button @click="Building.sell(data.x, data.y, SPECIAL_CHARS.shrine)">Sell for 80% of original price</button>
    </div>`
  });
  Vue.component("lure-menu", {
    props: ["data"],
    data: () => ({
      SPECIAL_CHARS,
      Building
    }),
    template: `<div style='padding: 10px;'>
      <h1>Lure</h1>
      <br><br><br><br>
      <button @click="Building.sell(data.x, data.y, SPECIAL_CHARS.lure)">Sell for 80% of original price</button>
    </div>`
  });

  Vue.component("areaclearer-menu", {
    props: ["data"],
    data: () => ({
      player,
      Research,
      BUILDINGS,
      SPECIAL_CHARS,
      Building,
      Decimal
    }),
    methods: {
      format,
      polysoft
    },
    computed: {
      building() {
        return Building.getByPos(this.data.x, this.data.y, SPECIAL_CHARS.theta);
      },
      maxPow() {
        let pow = 6;
        if (Research.has("clearing", 2)) pow = 9;
        if (Magic.Enchants.has("l1")) pow = 20;

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
      <span style="vertical-align: middle;">Clearing power: {{format(Decimal.pow(2, polysoft(building.meta, 9)), 0)}} |
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
  });
  Vue.component("sectorclearer-menu", {
    props: ["data"],
    data: () => ({
      player,
      Research,
      BUILDINGS,
      SPECIAL_CHARS,
      Building,
      Decimal
    }),
    methods: {
      format,
      polysoft
    },
    computed: {
      building() {
        return Building.getByPos(this.data.x, this.data.y, SPECIAL_CHARS.slashO);
      },
      maxPow() {
        let pow = 9;
        if (Magic.Enchants.has("l1")) pow = 20;

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
      <span style="vertical-align: middle;">Clearing power: 
        {{format(Decimal.pow(2, polysoft(building.meta.power, 9)), 0)}} |
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
  });

  Vue.component("torch-menu", {
    props: ["data"],
    data: () => ({
      Building
    }),
    template: `<div style='padding: 10px;'>
      <h1>Torch</h1>
      <br><br><br><br>
      <button @click="Building.sell(data.x, data.y, 'i')">Sell for 80% of original price</button>
    </div>`
  });
}

const accessData = {
  tiles: []
};
function openMenu(x, y) {
  const tileName = map[x][y][0];
  if (player.buildings[tileName] && !Building.getByPos(x, y, map[x][y][0])) {
    map[x][y][0] = getMapEmpty(x, y);
    return;
  }
  const name = (typeof(MENU_DATA[tileName].name) === "undefined" ? tileName : MENU_DATA[tileName].name);
  Modal.show({
    title: `<span style="font-size: 35px; color: ${tileStyle[tileName]};">${name}</span>`,
    bind: `${MENU_DATA[tileName].id}-menu`,
    bindData: { x, y, tile: map[x][y] },
    style: (typeof(MENU_DATA[tileName].style) === "undefined" ? {} : MENU_DATA[tileName].style)
  });
  if (MENU_DATA[tileName].onOpen) MENU_DATA[tileName].onOpen();
}

const MENU_DATA = {
  [SPECIAL_CHARS.dia]: {
    id: "crystal",
    name: "Construction firm",
    style: {
      width: "750px",
      height: "500px"
    }
  },
  [SPECIAL_CHARS.house]: {
    id: "research",
    name: "Laboratory",
    style: {
      width: "700px",
      height: "500px"
    }
  },
  [SPECIAL_CHARS.gear]: {
    id: "village",
    name: "Village",
    style: {
      width: "700px",
      height: "600px"
    },
    onOpen() {
      if (!player.loreUnlocks.village) {
        Modal.show({
          title: "The village",
          text: `<div style="margin: 30px;">
            Civilisation? On this desolate, sorry planet?<br><br>
            Perhaps the previous civilisation used up all the resources as well.<br>
            The villagers here are starving, and they're willing to exchange some of their tricks with you for food.
          </div>`,
          buttons: [{
            text: "Next",
            onClick() {
              Modal.closeFunc();
            }
          }],
          close() {
            player.loreUnlocks.village = true;
            openMenu(30, 30);
          }
        });
      }
    }
  },
  [SPECIAL_CHARS.tri]: { id: "drillv1" },
  V: { id: "drillv2" },
  x: { id: "trap" },
  [SPECIAL_CHARS.shrine]: { id: "shrine" },
  [SPECIAL_CHARS.lure]: { id: "lure" },
  [SPECIAL_CHARS.theta]: { id: "areaclearer" },
  [SPECIAL_CHARS.slashO]: { id: "sectorclearer" },
  i: { id: "torch" }
};
