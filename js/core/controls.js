"use strict";
function loadControls() {
  window.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();
    if (typeof controls[`press${key.toUpperCase()}`] === "function") controls[`press${key.toUpperCase()}`]();
    if (controls[key] !== undefined && !Modal.showing)
      controls[key] = true;
  });

  window.addEventListener("keyup", e => {
    const key = e.key.toLowerCase();
    if (typeof(controls[key]) !== "undefined") controls[key] = false;
  });

  // eslint-disable-next-line no-new
  new Updater(() => {
    const prevCompass = controls.compass;
    controls.compass = (controls.q && Research.has("access", 4));
    if (controls.compass !== prevCompass) canvas.need2update = true;

    const prevVision = controls.nightvision;
    controls.nightvision = (controls.n && Research.has("access", 4));
    if (controls.nightvision !== prevVision) canvas.need0update = true;

    const right = controls.d || controls.arrowright,
      left = controls.a || controls.arrowleft,
      up = controls.w || controls.arrowup,
      down = controls.s || controls.arrowdown;

    if (right || left || up || down) {
      controls.ticks++;

      if (controls.shift) {
        if (right) 
          placeData.facing = 0;
        else if (left)
          placeData.facing = 2;
        else if (up)
          placeData.facing = 3;
        else if (down) 
          placeData.facing = 1;
      }

      canvas.need1update = true;
    } else {
      controls.ticks = 0;
    }

    if (controls.ticks !== 1) {
      controls.ticks %= (player.attributes.food.lte(10) ? 8 : 4);
      return;
    }

    if (controls.shift && placeData.node) return;

    // eslint-disable-next-line prefer-const
    let { x, y } = player.pos;

    if (right && checkTileAccess(x + 1, y)) {
      player.pos.x++;
      x++; // Needed to prevent diagonal clipping into blocks. Don't remove it again!
    } else if (left && checkTileAccess(x - 1, y)) {
      player.pos.x--;
      x--;
    }
    if (up && checkTileAccess(x, y - 1)) {
      player.pos.y--;
    } else if (down && checkTileAccess(x, y + 1)) {
      player.pos.y++;
    }

    render();
    updateTileUsage();
  });
}

const controls = {
  w: false,
  a: false,
  s: false,
  d: false,
  q: false,
  n: false,
  nightvision: false,
  compass: false,
  shift: false,
  pressA() {
    if (paused) return;
    if (accessData.tiles.includes(2)) {
      openMenu(...getXYfromDir(2));
    }
  },
  pressARROWLEFT() {
    if (paused) return;
    if (accessData.tiles.includes(2)) {
      openMenu(...getXYfromDir(2));
    }
  },
  pressW() {
    if (paused) return;
    if (accessData.tiles.includes(3)) {
      openMenu(...getXYfromDir(3));
    }
  },
  pressARROWUP() {
    if (paused) return;
    if (accessData.tiles.includes(3)) {
      openMenu(...getXYfromDir(3));
    }
  },
  pressD() {
    if (paused) return;
    if (accessData.tiles.includes(0)) {
      openMenu(...getXYfromDir(0));
    }
  },
  pressARROWRIGHT() {
    if (paused) return;
    if (accessData.tiles.includes(0)) {
      openMenu(...getXYfromDir(0));
    }
  },
  pressS() {
    if (paused) return;
    if (accessData.tiles.includes(1)) {
      openMenu(...getXYfromDir(1));
    }
  },
  pressARROWDOWN() {
    if (paused) return;
    if (accessData.tiles.includes(1)) {
      openMenu(...getXYfromDir(1));
    }
  },
  "press "() {
    if (paused) return;
    Building.stopPlacing();
  },
  arrowup: false,
  arrowleft: false,
  arrowdown: false,
  arrowright: false,
  pressESCAPE() {
    if (Modal.showing)
      Modal.closeFunc();
    else if (placeData.node) {
      placeData.node = "";
      canvas.need1update = true;
      if (Research.has("access", 2)) canvas.need0update = true;
    } else {
      paused = true;
      Modal.show({
        title: "Paused",
        text: `<br><br>Paused`,
        close() {
          paused = false;
          Modal.close();
        },
        buttons: [{ text: "Unpause", onClick() { Modal.closeFunc(); } }]
      });
    }
  },
  pressE() {
    if (paused) return;
    if (Research.has("access", 1)) openMenu(351, 351);
  },
  pressR() {
    if (paused) return;
    if (Research.has("access", 3)) openMenu(357, 365);
  },
  pressV() {
    if (paused) return;
    if (Research.has("access", 5)) openMenu(300, 300);
  },
  ticks: 0
};


const walkable = [".", "^"];
function getXYfromDir(dir) {
  const { x, y } = player.pos;
  // eslint-disable-next-line no-param-reassign
  dir = Number(dir);
  switch (dir) {
  case 0: return [x + 1, y];
  case 1: return [x, y + 1];
  case 2: return [x - 1, y];
  case 3: return [x, y - 1];
  default: return [0, 0];
  }
}
function checkTileAccess(x, y) {
  if (x > 420 || x < 0) return false;
  if (y > 420 || y < 0) return false;
  return walkable.includes(map[x][y][0]);
}
function updateTileUsage() {
  accessData.tiles = [];

  const dirList = [0, 1, 2, 3];
  for (const i in dirList) {
    const [x, y] = getXYfromDir(i);
    if (x < 0 || x > 420 || y < 0 || y > 420) return;
    if (MENU_DATA[map[x][y][0]]) accessData.tiles.push(Number(i));
  }

  canvas.need2update = true;
}