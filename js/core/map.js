/* eslint-disable no-console */
"use strict";
let map, noiseMap;

const xDim = 30, yDim = 30;

const SPECIAL_TILES = [{
  // Building hall
  pos: { x: 15, y: 15 },
  tile: SPECIAL_CHARS.dia,
  meta: D(0)
}, {
  // Upgrades
  pos: { x: 7, y: 5 },
  tile: SPECIAL_CHARS.house,
  meta: D(0)
}, {
  // I forget. We'll have to go there someday. 
  pos: { x: 3, y: 5 },
  tile: SPECIAL_CHARS.gear,
  meta: D(0)
}];
function loadMap(xPos = 0, yPos = 0) {
  let dimRadius = Math.ceil(distance([xPos, yPos], [0, 0]));
  if (dimRadius === 0) dimRadius = 15;
  else dimRadius += 5;
  const decimalone = D(1),
    decimal1e7 = D(1e7);
  const prevTime = Date.now();
  const layer1 = Lerp(Noise(6, 6, 0.45), 6),
    layer2 = Lerp(Noise(41, 41, 0.45), 15),
    layer3 = Lerp(Noise(101, 101, 0.3), 6);
  console.log(`Finished noisemap generation: ${Date.now() - prevTime}ms`);

  const defaultMap = layer1.map((x, i) => x.map((y, j) => {
    // Determine the value of the tile,
    // using some noise maps to make borders between various barrier types more interesting. 
    const tile = y + layer2[i][j] + layer3[i][j] + 
      Math.pow(Math.max(distance([i, j], [15, 15]), 0), 1 / 2);
    // If the tile should be 0 (near the center), then just put the generic tile if no barrier is there. 
    if (tile < Math.sqrt(dimRadius)) return [getMapEmpty(x, y), decimal1e7];
    // Otherwise, smite it from existence. 
    return [" ", decimalone];
    // Return [Math.floor(tile).toString(16).toUpperCase(), decimalone];
  }));

  // Insert DFS function. 
  // let filteredMap = [];
  // for (let i = 0; i < xDim + 1; i++) {
  //   filteredMap.push([]);
  //   for (let j = 0; j < yDim + 1; j++) filteredMap[i][j] = 0;
  // }
  // filteredMap = depthFirstSearch(filteredMap, defaultMap, 10, 10);
  // console.log(filteredMap);

  noiseMap = [];
  for (let i = 0; i < xDim + 1; i++) {
    noiseMap.push([]);
    for (let j = 0; j < yDim + 1; j++) {
      noiseMap[i][j] = defaultMap[i][j];
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

  
  canvas.need0update = true;
  canvas.need1update = true;
}

function depthFirstSearch(editedMap, searchedMap, xPos, yPos) {
  console.log(`(x: ${xPos}, y: ${yPos})`);
  if (editedMap[xPos][yPos]) return editedMap;
  let returnedMap = editedMap;
  returnedMap[xPos][yPos] = 1;
  if (typeof(searchedMap[xPos + 1]) !== "undefined" && searchedMap[xPos + 1][yPos][0] === ".") {
    returnedMap = depthFirstSearch(returnedMap, searchedMap, xPos + 1, yPos);
  }
  if (typeof(searchedMap[xPos - 1]) !== "undefined" && searchedMap[xPos - 1][yPos] === ".") {
    returnedMap = depthFirstSearch(returnedMap, searchedMap, xPos - 1, yPos);
  }
  if (searchedMap[xPos][yPos + 1] === ".") returnedMap = depthFirstSearch(returnedMap, searchedMap, xPos, yPos + 1);
  if (searchedMap[xPos][yPos - 1] === ".") returnedMap = depthFirstSearch(returnedMap, searchedMap, xPos, yPos - 1);
  return returnedMap;
}

function decodeMap(area) {
  if (area.includes(",,,"))
    return area.split(",,,").map(r => r.split(",,").map(p => [p[0], D(p.slice(2))]));
  return area.split("#").map(r => r.split(",").map(p => [p[0], D(p.slice(1))]));
}

function getMapEmpty(x, y) {
  // All points within 35 units of (370, 390) are "grass". 
  if (distance([x, y], [30, 30]) <= 25) return "^";
  // Everything else is "stone".
  return ".";
}