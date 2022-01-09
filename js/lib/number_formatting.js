"use strict";
function format(num, precision = 2, precisionAfter = 3) {
  const decNum = D(num);
  if (num < 1e6) return Number(num).toFixed(precision);
  let e = decNum.e, m = decNum.m;
  if (m >= 9.995) {
    m = 1;
    e++;
  }
  return `${m.toFixed(precisionAfter)}e${formatWhole(e)}`;
}

function formatWhole(num) {
  const decNum = D(num).floor();
  if (decNum.e < 5) return decNum.toString();
  return decNum.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}