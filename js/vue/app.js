"use strict";
let app;

function loadVue() {
  Notifier.load();
  Modal.load();
  Vue.config.devtools = true;

  Vue.component("top-text", {
    data: () => ({
      Research,
      SPECIAL_CHARS,
      player,
      format,
      formatWhole,
      Decimal,
      Modal,
      updatedInfo
    }),
    template: `<div style="position: relative; height: 100%;">
      <div style="position: absolute;">
        <span style="font-size: 20px">
          <span>{{format(player.currency.shards)}} <span class="curr shards">_</span> (+{{format(updatedInfo.shardGain)}}/s)</span>
          <span v-if="Research.has('trapping', 1)"> |
          {{format(player.currency.food, 0)}} <span class="curr food">{{SPECIAL_CHARS.meat}}</span></span>
          <span v-if="player.loreUnlocks.village"> |
          {{format(player.currency.magic, 0)}} <span class="curr magic">*</span></span>
        </span>
        <br>
        Welcome to Cassiopeia. Press WASD to navigate around the planet.
      </div>
      <a href="https://discord.gg/DVy4XjB" target="newtab" style="position: absolute; left: 0; bottom: 0;">Discord</a>
      <button style="position: absolute; right: 0; bottom: 0;" onclick="Modal.show({
        title: 'Controls',
        bind: 'controls-menu'
      })">
        Controls
      </button>
      <div style="position: absolute; right: 0">
        <button onclick="Modal.show({
          title: 'Options',
          bind: 'options-menu'
        })">Options</button>
        <button onclick="paused = true;
        Modal.show({
          title: 'Paused',
          text: \`<br><br>Paused\`,
          close() {
            paused = false;
            Modal.close();
          },
          buttons: [{text: 'Unpause', onClick() {Modal.closeFunc()}}]
        })">Pause</button>
        <button onclick="Modal.show({
          title: 'Credits',
          text: \`<br>
          Game and Graphics: Dystopia181<br><br>
          Inspired by: <b>Cleansed</b> by Yhvr (<a href='https://yhvr.itch.io/cleansed' target='newtab'>Link</a>)<br><br>
          People who helped out:<br>
          asterisk_man<br>
          Buck<br>
          Baboooshka<br>
          RomanQrr<br>
          fqwehgtui<br>
          kajfik\`,
          buttons: [{text: 'Close', onClick() {Modal.close()}}]
        })">Credits</button>
      </div>
    </div>`
  });
  Vue.component("attributes", {
    data: () => ({
      SPECIAL_CHARS,
      attrs: player.attributes
    }),
    methods: {
      format
    },
    template: `<div id="attr-container">
      <span class="attr health"></span>
      <div class="bar-background">
        <div :style="{
          width: attrs.health.min(100)*2 + 'px'
        }" class="bar-foreground healthbg"></div>
      </div>
      <br>
      <span class="attr food">{{SPECIAL_CHARS.meat}}</span>
      <div class="bar-background">
        <div :style="{
          width: attrs.food.min(100)*2 + 'px'
        }" class="bar-foreground meatbg"></div>
      </div>
      <br><br>
      <span class="attr power"></span>
      <span style="font-size: 30px;" class="mid">{{format(attrs.powerUsed, 0)}}/{{format(attrs.power, 0)}}</span>
    </div>`
  });
  Vue.component("options-menu", {
    data: () => ({
      player
    }),
    template: `<div style="text-align: center">
      <span style="font-size: 18px">Saving:</span>
      <br>
      <button class="option" onclick="player.options.autosave = !player.options.autosave;">Autosave: {{player.options.autosave ? "ON" : "OFF"}} (20s)</button>
      <button class="option" onclick="save()">Manual Save</button>
      <button class="option" onclick="Modal.show({
        title: 'Hard Reset',
        text: '<br><br>Are you sure you want to hard reset?',
        buttons: [{
          text: 'Yes',
          onClick() {
            reset();
          }
        },{
          text: 'No',
          onClick() {
            Modal.close();
          }
        }]
      })">HARD RESET</button>
      <br>
      <span style="font-size: 18px">Visuals:</span>
      <br>
      <button class="option" onclick="player.options.showTilePopups = !player.options.showTilePopups; renderLayer2();">
        Show "Use" tooltips: {{player.options.showTilePopups ? "ON" : "OFF"}}</button>
      <button class="option" onclick="player.options.showTileU = !player.options.showTileU; renderLayer2();">
        Show unexplored tile tooltips: {{player.options.showTileU ? "ON" : "OFF"}}</button>
    </div>`
  });
  Vue.component("controls-menu", {
    data: () => ({
      Research,
      Magic
    }),
    template: `<div style="text-align: center;"><br><br><br>
    WASD/arrow keys: Move/Access building<br>
    Shift+WASD/arrow keys: Rotate building when placing<br>
    Space: Place building<br>
    Escape: Close Modal/Stop placing building/Pause game<br>
    <br>
    <span v-if="Research.has('access', 1)">E: Open the building menu<br></span>
    <span v-if="Research.has('access', 3)">R: Open the research menu<br></span>
    <span v-if="Research.has('access', 5)">V: Open the village menu<br></span>
    <span v-if="Research.has('access', 4)">Q: Show the compass<br></span>
    <span v-if="Magic.Enchants.has('l2')">N: Enable night vision<br></span></div>`
  });
  Vue.component("mobile-controls", {
    data: () => ({
      isMobile,
      simulateKeypress,
      SPECIAL_CHARS,
      tileStyle,
      Research,
      Magic,
      placeData,
      qToggle: false,
      nToggle: false
    }),
    template: `<div style="position: absolute; border: 2px solid; background-color: var(--bg2); bottom: 0;" v-if="isMobile">
      <div style="display: flex">
        <button class="mobile" v-if="Research.has('access', 1)"
        @mousedown="simulateKeypress('e', 'down')" @mouseup="simulateKeypress('e', 'up')">{{SPECIAL_CHARS.dia}}</button>
        <button class="mobile" v-if="Research.has('access', 3)" style="color: #2288ff"
        @mousedown="simulateKeypress('r', 'down')" @mouseup="simulateKeypress('r', 'up')">{{SPECIAL_CHARS.house}}</button>
        <button class="mobile" v-if="Research.has('access', 5)" style="color: #887777"
        @mousedown="simulateKeypress('v', 'down')" @mouseup="simulateKeypress('v', 'up')">{{SPECIAL_CHARS.gear}}</button>
        <button class="mobile" style="visibility: hidden"></button>
        <button class="mobile" @mousedown="simulateKeypress('escape', 'down')">Esc</button>
      </div>
      <div style="display: flex">
        <button class="mobile" v-if="Research.has('access', 4)" @click="qToggle = !qToggle;
        simulateKeypress('q', qToggle ? 'down' : 'up')">Q</button>
        <button class="mobile" v-if="Magic.Enchants.has('l2')" @click="nToggle = !nToggle;
        simulateKeypress('n', nToggle ? 'down' : 'up')">N</button>
      </div>
      <br>
      <div style="display: flex" v-if="placeData.node">
        <button class="mobile fulltxt" style="width: 75px;"
        @mousedown="simulateKeypress('space', 'down')">Place</button>
        <button class="mobile fulltxt" style="width: 75px;"
        @mousedown="simulateKeypress('shift', 'down')" @mouseup="simulateKeypress('shift', 'up')">Shift</button>
      </div>
      <div style="display: flex">
        <button class="mobile" style="visibility: hidden"></button>
        <button class="mobile"
        @mousedown="simulateKeypress('w', 'down')" @mouseup="simulateKeypress('w', 'up')">W</button>
      </div>
      <div style="display: flex">
        <button class="mobile"
        @mousedown="simulateKeypress('a', 'down')" @mouseup="simulateKeypress('a', 'up')">A</button>
        <button class="mobile"
        @mousedown="simulateKeypress('s', 'down')" @mouseup="simulateKeypress('s', 'up')">S</button>
        <button class="mobile"
        @mousedown="simulateKeypress('d', 'down')" @mouseup="simulateKeypress('d', 'up')">D</button>
      </div>
    </div>`
  });

  loadMenus();
  
  app = new Vue({
    el: "#app",
    data: {
      player,
      format,
      formatWhole,
      Decimal,
      notifiers,
      Notifier,
      Modal,
      controls,
      SPECIAL_CHARS
    },
    methods: {
      D
    }
  });
}