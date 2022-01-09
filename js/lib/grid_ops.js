"use strict";
function distance([x1, y1], [x2, y2]) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function distGrid([x1, y1], [x2, y2]) {
  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

function polysoft(v, s, m = 0.7) {
  const Dv = D(v);
  const Ds = D(s);
  if (Dv.lte(Ds)) return Dv;
  return Ds.mul(Decimal.pow(Dv.div(Ds), m));
}

const SPECIAL_CHARS = {
  dia: LZString.decompressFromBase64("mZkQ"),
  house: LZString.decompressFromBase64("kDEQ"),
  gear: LZString.decompressFromBase64("plkQ"),
  tri: LZString.decompressFromBase64("inAQ"),
  shrine: atob("sQ=="),
  lure: LZString.decompressFromBase64("gXAQ"),
  ohm: LZString.decompressFromBase64("pXAQ"),
  theta: LZString.decompressFromBase64("h3AQ"),
  power: LZString.decompressFromBase64("rwbifdo="),
  slashO: atob("2A=="),
  health: LZString.decompressFromBase64("ibkQ"),
  meat: LZString.decompressFromBase64("mXAQ")
};