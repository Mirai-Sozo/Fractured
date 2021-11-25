/* eslint-disable no-param-reassign */
"use strict";
function Updater(func) {
  this.id = Updater.length;
  Updater.updates.push({
    func,
    running: true
  });
  this.updater = Updater.updates[this.id];
}
Updater.updates = [];

function gameLoop(d) {
  if (paused) return;
  d = Math.min(d, 10);
  player.time.timeStat += d;
  player.time.thisTick = Date.now();
  const trueDiff = d;
  if (Magic.Spells.has("temporal"))
    d *= 2;

  if (player.loreUnlocks.start && player.attributes.health.gt(0)) {
    for (const spell in player.spells) {
      const s = player.spells[spell];
      if (s.time > 0) {
        s.time = Math.max(0, s.time - trueDiff);
      }
    }
    const prevShard = player.currency.shards;
    for (const b of player.buildings[SPECIAL_CHARS.tri]) {
      const tile = map[b.pos.x][b.pos.y];

      if (b.meta.gt(0)) {
        const gain = b.meta
          .mul(BUILDINGS[SPECIAL_CHARS.tri].usageDiv)
          .min(BUILDINGS[SPECIAL_CHARS.tri].getProduction(b).mul(d));

        player.currency.shards = player.currency.shards.add(gain.mul(BUILDINGS[SPECIAL_CHARS.tri].getMult(b)));
        tile[1] = tile[1].sub(gain.div(BUILDINGS[SPECIAL_CHARS.tri].usageDiv));
        b.meta = b.meta.sub(gain.div(BUILDINGS[SPECIAL_CHARS.tri].usageDiv));
      }
    }
    if (Research.has("trapping", 3)) {
      player.currency.food = player.currency.food.sub(player.buildingAmt[SPECIAL_CHARS.shrine].mul(20 * d)).max(0);
    }
    for (const b of player.buildings.V) {
      const tile = map[b.pos.x][b.pos.y];

      if (b.meta.gt(0)) {
        const gain = b.meta.mul(BUILDINGS.V.usageDiv).min(BUILDINGS.V.getProduction(b).mul(d));

        player.currency.shards = player.currency.shards.add(gain.mul(BUILDINGS.V.getMult(b)));
        tile[1] = tile[1].sub(gain.div(BUILDINGS.V.usageDiv));
        b.meta = b.meta.sub(gain.div(BUILDINGS.V.usageDiv));
      }
    }
    updatedInfo.shardGain = player.currency.shards.sub(prevShard).div(trueDiff);
    const usage = BUILDINGS.x.shardUsage;
    for (const b of player.buildings.x) {
      const randNum = Math.random();
      let chance = 0.9;
      for (const b2 of player.buildings[SPECIAL_CHARS.lure]) {
        if (distGrid([b.pos.x, b.pos.y], [b2.pos.x, b2.pos.y]) < 3) {
          chance = 0.8;
          break;
        }
      }

      if (randNum < 1 - Math.pow(chance, d) && b.meta.active && player.currency.shards.gte(usage)) {
        const cap = Decimal.floor(Math.log10(Math.max(randNum, Number.EPSILON)) / Math.log10(1 - Math.pow(chance, d)))
          .min(player.currency.shards.div(usage).floor());
        b.meta.food = b.meta.food.add(cap.mul(Magic.Spells.has("artemis") ? 40 : 15));
        player.currency.shards = player.currency.shards.sub(cap.mul(usage));
        if (Research.has("trapping", 2)) BUILDINGS.x.collect(b);
      }
    }
    EXPLORE.all(d);

    player.attributes.food = player.attributes.food.sub(0.25 * d).max(0);

    if (player.attributes.food.lte(0)) {
      player.attributes.health = player.attributes.health.sub(2 * d).max(50);
      canvas.need0update = true;
    } else if (player.attributes.health.lt(100) && player.attributes.food.gte(20)) {
      player.attributes.health = player.attributes.health.add(4 * d).min(100);
      player.attributes.food = player.attributes.food.sub(2 * d).max(20);
    }

    if (player.attributes.health.lte(0)) {
      Modal.show({
        title: "",
        text: `<br><br><h1>You died!</h1>`,
        close() {
          reset();
        },
        buttons: [{
          text: "Start over",
          onClick() {
            reset();
          }
        }]
      });
    }
  } else if (player.attributes.health.lte(0)) {
    Modal.show({
      title: "",
      text: `<br><br><h1>You died!</h1>`,
      close() {
        reset();
      },
      buttons: [{
        text: "Start over",
        onClick() {
          reset();
        }
      }]
    });
  }

  for (const i in Updater.updates) {
    const obj = Updater.updates[i];
    if (obj.running) obj.func(d);
  }
}
function renderLoop() {
  if (canvas.need0update) {
    render();
    canvas.need0update = false;
  }
  if (canvas.need1update) {
    renderLayer1();
    canvas.need1update = false;
  }
  if (canvas.need2update) {
    renderLayer2();
    canvas.need2update = false;
  }
}

let interval, autoInterval, renderInterval;

const updatedInfo = {
  shardGain: D(0)
};