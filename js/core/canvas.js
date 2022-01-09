"use strict";
let c, c1, c2, ctx, ctx1, ctx2;

const tileStyle = {
  ".": "#c96704",
  "^": "#44bb22",
  1: "#a1dbff",
  2: "#75caff",
  3: "#47b9ff",
  4: "#0aa1ff",
  5: "#0086d9",
  6: "#0075bd",
  7: "#005a91",
  8: "#004773",
  9: "#002760",
  A: "#400000",
  B: "#670000",
  C: "#9a0000",
  D: "#b10000",
  E: "#db0000",
  F: "#ff4040",
  G: "#ff7b1c",
  x: "#bbff40",
  i: "#ffd790",
  [SPECIAL_CHARS.ohm]: "#48FF87",
  [SPECIAL_CHARS.dia]: "#ffffff",
  [SPECIAL_CHARS.house]: "#2288ff",
  [SPECIAL_CHARS.gear]: "#887777",
  [SPECIAL_CHARS.tri]: "#aaaaaa",
  V: "#afaaee",
  [SPECIAL_CHARS.shrine]: "#882722",
  [SPECIAL_CHARS.lure]: "#ffff88",
  [SPECIAL_CHARS.theta]: "#ff88ff",
  [SPECIAL_CHARS.slashO]: "#d54aff",
  M: "#a6a6ed",
};

function loadCanvas() {
  c = document.querySelector("#c");
  ctx = c.getContext("2d");
  c1 = document.querySelector("#c1");
  ctx1 = c1.getContext("2d");
  c2 = document.querySelector("#c2");
  ctx2 = c2.getContext("2d");

  updateTileUsage();
  renderAll();
  window.onresize = renderAll;
}

const canvas = {
  need0update: false,
  need1update: false,
  need2update: false,
  objs: {
    lights: [],
    areaC: [],
    sectorC: [],
    i: []
  }
};

const lights = [
//  [351, 351], 
//  [357, 365], 
//  [300, 300]
];
function clampWithinCanvas(x, y, buffer) {
  const [i, j] = getPosInCanvas(x, y);

  if (i <= -buffer * 20) return false;
  if (i >= c.width + buffer * 20) return false;
  if (j <= -buffer * 25) return false;
  if (j >= c.height + buffer * 25) return false;
  return true;
}
function calcAlpha(x, y, draw = false) {
  // Return "ff";
  let alpha = 0;
  // If (controls.nightvision) {
  alpha = 1;
  // } else {
  // for (const l of canvas.objs.lights) {
  //     if (distance([x, y], l) < 12)
  //       alpha += Math.max(0, 1 - Math.sqrt(distance([x, y], l)) * 0.35);
  // }
  // 
  // for (const b of canvas.objs.areaC) {
  //     if (distGrid([x, y], [b.pos.x, b.pos.y]) < 5 && Research.has("clearing", 1)) {
  //       alpha = 1; 
  //       break;
  //     } else if (distGrid([x, y], [b.pos.x, b.pos.y]) < 4) {
  //       alpha = 1; 
  //       break;
  //     }
  // }
  // for (const b of canvas.objs.sectorC) {
  //     if (x === b.pos.x && y === b.pos.y) {
  //       alpha = 1;
  //       break;
  //     }
  //     const area = 10.9;
  // 
  //     if (distance([x, y], [b.pos.x, b.pos.y]) > area) continue;
  //     const angMin = (b.meta.preset - 1) * Math.PI / 2,
  //       angMax = (b.meta.preset) * Math.PI / 2;
  // 
  //     const angle = (Math.atan2(x - b.pos.x, y - b.pos.y) + Math.PI * 3 / 2) % (Math.PI * 2);
  //     if ((angle < angMin || angle > angMax) && !(angle === angMax % (Math.PI * 2))) continue;
  //     alpha = 1;
  //     break;
  // }
  // 
  // for (const b of canvas.objs.i) {
  //     const dist = distance([x, y], [b.pos.x, b.pos.y]);
  //     if (dist < 11) {
  //       alpha += Math.max(0, 0.8 - Math.sqrt(dist) * 0.25);
  //     }
  // }
  // if (distance([x, y], [player.pos.x, player.pos.y]) < 10)
  //     alpha += Math.max(0, 0.8 - Math.sqrt(distance([x, y], [player.pos.x, player.pos.y])) * 0.3);
  // 
  // alpha = Math.min(alpha, 1);
  // } 
  // if (player.attributes.health.lte(80)) alpha /= (95 - player.attributes.health) / 15;


  if (draw && UNEXPLORED_DATA[map[x][y][0]]) {
    if (map[x][y][1].lt(1)) {
      const tile = getMapEmpty(x, y);
      ctx.fillStyle = (tileStyle[tile] === undefined ? "#ffffff" : tileStyle[tile]) + (
        `0${Math.round((alpha * (1 - map[x][y][1])) * 255).toString(16)}`).slice(-2);

      const [i, j] = getPosInCanvas(x, y);
      ctx.fillText(tile, i, j + 25);

      alpha *= map[x][y][1];
    }
  }
  if (map[x][y][0] === "x" && Building.getByPos(x, y, "x").meta.active === false) alpha *= 0.4;

  alpha = Math.round(alpha * 255);

  return (`0${alpha.toString(16)}`).slice(-2);
}

function getPosInCanvas(x, y) {
  return [(x - player.pos.x + Math.floor(Math.floor(c.width / 20) / 2)) * 20 + 10,
    (y - player.pos.y + Math.floor(Math.floor(c.height / 25) / 2)) * 25];
}
function getMapByCanvas(x, y) {
  const posX = Math.floor(x / 20),
    posY = Math.floor(y / 25);
  return [posX + player.pos.x - Math.floor(Math.floor(c.width / 20) / 2),
    posY + player.pos.y - Math.floor(Math.floor(c.height / 25) / 2)];
}

function updateUnexploredTile(event) {
  const [x, y] = getMapByCanvas(event.offsetX, event.offsetY);
  darknessTooltip = [];
  if (x < 0 || x > xDim || y < 0 || y > yDim) return renderLayer2();

  const tile = map[x][y];
  if (!UNEXPLORED_DATA[tile[0]] || parseInt(calcAlpha(x, y), 16) < 5) return renderLayer2();

  darknessTooltip = [x, y,
    `${format(tile[1].mul(UNEXPLORED_DATA[tile[0]].health), 0) 
    }/${format(UNEXPLORED_DATA[tile[0]].health, 0)}`];
  renderLayer2();
  return 0; // Not sure what this does, but ESLint got mad at me. 
}

function tooltipText(context, x, y, text, arrowDir = "top") {
  context.font = "18px Iosevka Term SS08 Web";
  context.textAlign = "center";

  context.strokeStyle = "#fff";
  context.fillStyle = "#000b";
  context.lineWidth = 2;
  const yDiff = arrowDir === "top" ? -25 : 32;
  const length = context.measureText(text).width + 8,
    xDiff = length / 2;
  context.fillRect(x - xDiff, y + yDiff, length, 25);
  context.strokeRect(x - xDiff, y + yDiff, length, 25);

  context.fillStyle = "#fff";
  context.beginPath();
  if (arrowDir === "top") {
    context.moveTo(x - 5, y);
    context.lineTo(x + 5, y);
    context.lineTo(x, y + 5);
  } else {
    context.moveTo(x - 5, y + 32);
    context.lineTo(x + 5, y + 32);
    context.lineTo(x, y + 27);
  }

  context.fill();

  context.fillText(text, x, y + yDiff + 19);
}

function render() {
  const testTime = Date.now();
  c.width = window.innerWidth - 4;
  c.height = window.innerHeight - 114;
  ctx.font = "25px Iosevka Term SS08 Web";
  ctx.textAlign = "center";

  const width = Math.floor(c.width / 20),
    height = Math.floor(c.height / 25);

  canvas.objs.lights = lights.filter(b => clampWithinCanvas(b[0], b[1], 12));
  canvas.objs.areaC = player.buildings[SPECIAL_CHARS.theta].filter(b => clampWithinCanvas(b.pos.x, b.pos.y, 4));
  canvas.objs.sectorC = player.buildings[SPECIAL_CHARS.slashO].filter(b => clampWithinCanvas(b[0], b[1], 11));
  canvas.objs.i = player.buildings.i.filter(b => clampWithinCanvas(b[0], b[1], 10));

  for (let i = 0; i <= width; i++) {
    const x = i + player.pos.x - Math.floor(width / 2);
    if (x < 0 || x > xDim) continue;
    for (let j = 0; j <= height; j++) {
      const y = j + player.pos.y - Math.floor(height / 2);
      if (y < 0 || y > yDim) continue;
      let tile = map[x][y][0];
      if (x === player.pos.x && y === player.pos.y) tile = "M"; // SPECIAL_CHARS.ohm;

      ctx.fillStyle = (tileStyle[tile] === undefined ? "#ffffff" : tileStyle[tile]) + calcAlpha(x, y, true);
      if (Research.has("access", 2)) {
        let sub, max, has = true;
        switch (placeData.node) {
        case SPECIAL_CHARS.tri:
          sub = BUILDINGS[SPECIAL_CHARS.tri].subConstant;
          max = 1e7 - sub;

          break;
        case "V":
          sub = BUILDINGS.V.subConstant;
          max = 1e7 - sub;

          break;
        default:
          has = false;
          break;
        }
        if (has && tile === getMapEmpty(x, y) && map[x][y][1] - sub < max / 10) {
          ctx.fillStyle = `#ff0000${calcAlpha(x, y, true)}`;
          tile = "-";
        }
      }
      ctx.fillText(tile, i * 20 + 10, j * 25 + 25);
    }
  }
  // The plan is to make the game run at 30fps. 
  // eslint-disable-next-line no-console
  if (Date.now() - testTime > 33) console.log(`WARN: tick took ${Date.now() - testTime}ms`);
}

function renderLayer1() {
  c1.width = window.innerWidth - 4;
  c1.height = window.innerHeight - 114;

  if (placeData.node) {
    ctx1.font = "25px Iosevka Term SS08 Web";
    ctx1.textAlign = "center";

    const [x, y] = getXYfromDir(placeData.facing);
    // eslint-disable-next-line prefer-const
    let [px, py] = getPosInCanvas(x, y);
    py += 25;

    ctx1.shadowBlur = 15;
    if (BUILDINGS[placeData.node].canPlace(x, y)) {
      ctx1.fillStyle = tileStyle[placeData.node];
      ctx1.shadowColor = tileStyle[placeData.node];
    } else {
      ctx1.fillStyle = "#f00";
      ctx1.shadowColor = "#f00";
    }

    ctx1.fillText(placeData.node, px, py);
  }
}

let darknessTooltip = [];
function renderLayer2() {
  c2.width = window.innerWidth - 4;
  c2.height = window.innerHeight - 114;

  if (player.options.showTilePopups) {
    ctx2.font = "18px Iosevka Term SS08 Web";
    ctx2.textAlign = "center";

    for (const i of accessData.tiles) {
      const [x, y] = getPosInCanvas(...getXYfromDir(i));
      const text = `Use [${["D", "S", "A", "W"][i]}]`;
      if (i === 1 || i === 2) {
        tooltipText(ctx2, x, y, text, "bottom");
      } else {
        tooltipText(ctx2, x, y, text, "top");
      }
    }
  }
  if (darknessTooltip.length && player.options.showTileU) {
    const d = darknessTooltip;
    const [x, y] = getPosInCanvas(d[0], d[1]);
    tooltipText(ctx2, x, y, darknessTooltip[2], "top");
  }
  if (controls.compass) {
    ctx2.fillStyle = "#17141188";
    ctx2.strokeStyle = "#fff";
    ctx2.lineWidth = 5;
    ctx2.beginPath();
    // eslint-disable-next-line prefer-const
    let [x, y] = getPosInCanvas(player.pos.x, player.pos.y);
    y += 12.5;
    ctx2.arc(x, y, 100, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.stroke();
    ctx2.lineCap = "round";

    for (const t of SPECIAL_TILES) {
      if (!(typeof(t.show) === "undefined" ? true : t.show)) continue;
      let distVec = [t.pos.x - player.pos.x, t.pos.y - player.pos.y];
      // eslint-disable-next-line no-loop-func
      distVec = distVec.map(val => val * 90 / distance(distVec, [0, 0]));

      ctx2.strokeStyle = tileStyle[t.tile];
      ctx2.beginPath();
      ctx2.moveTo(x, y);
      ctx2.lineTo(x + distVec[0], y + distVec[1]);
      ctx2.stroke();
    }
  }
}

function renderAll() {
  render();
  renderLayer1();
  renderLayer2();
}