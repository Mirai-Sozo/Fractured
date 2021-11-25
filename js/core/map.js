/* eslint-disable no-console */
"use strict";
let map, noiseMap;

const SPECIAL_TILES = [{
  pos: { x: 351, y: 351 },
  tile: SPECIAL_CHARS.dia,
  meta: D(0)
}, {
  pos: { x: 357, y: 365 },
  tile: SPECIAL_CHARS.house,
  meta: D(0)
}, {
  pos: { x: 300, y: 300 },
  tile: SPECIAL_CHARS.gear,
  meta: D(0)
}];
function loadMap() {
  const decimalone = D(1),
    decimal1e7 = D(1e7);
  const prevTime = Date.now();
  const layer1 = Lerp(Noise(25, 25, 0.45), 20),
    layer2 = Lerp(Noise(41, 41, 0.45), 15),
    layer3 = Lerp(Noise(101, 101, 0.3), 6);
  console.log(`Finished noisemap generation: ${Date.now() - prevTime}ms`);

  const defaultMap = layer1.map((x, i) => x.map((y, j) => {
    const tile = Math.floor(y + layer2[i][j] + layer3[i][j] + 
      Math.pow(Math.max(distance([i, j], [351, 351]) / 9 - 0.18, 0), 0.65));

    if (tile === 0) return [getMapEmpty(x, y), decimal1e7];
    return [tile.toString(16).toUpperCase(), decimalone];
  }));
  noiseMap = [];
  for (let i = 0; i < 421; i++) {
    noiseMap.push([]);
    for (let j = 0; j < 421; j++) {
      noiseMap[i][j] = defaultMap[i][j];
    }
  }
  for (let i = 355; i < 358; i++) {
    for (let j = 360; j < 363; j++) {
      noiseMap[i][j] = ["^", decimal1e7];
    }
  }
  console.log(`Finished map generation: ${Date.now() - prevTime}ms`);

  for (const i of SPECIAL_TILES) {
    noiseMap[i.pos.x][i.pos.y] = [i.tile, i.meta];
  }
  if (localStorage.getItem(`${saveKey}map`) === null) {
    map = noiseMap.map(_ => _.slice());
  } else {
    try {
      map = decodeMap(localStorage.getItem(`${saveKey}map`));
    } catch (error) {
      map = noiseMap.map(x => x.map(y => y.slice()));
      console.log(error);
    }
  }

  for (const i of SPECIAL_TILES) {
    map[i.pos.x][i.pos.y] = [i.tile, i.meta];
  }
  console.log(`Finished loadMap: ${Date.now() - prevTime}ms`);
}
function decodeMap(area) {
  if (area.includes(",,,"))
    return area.split(",,,").map(r => r.split(",,").map(p => [p[0], D(p.slice(2))]));
  return area.split("#").map(r => r.split(",").map(p => [p[0], D(p.slice(1))]));
}

function getMapEmpty(x, y) {
  if (distance([x, y], [370, 390]) <= 35) return "^";
  return ".";
}