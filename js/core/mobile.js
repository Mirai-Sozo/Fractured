"use strict";
function detectMobile() {
  const toMatch = [
    /Android/u, // For the record, this used to be /Android/i .
    /webOS/u,   // I am unsure of the implications of changing it. 
    /iPhone/u,  // But ESLint told me to, and so it shall be. 
    /iPad/u,
    /iPod/u,
    /BlackBerry/u,
    /Windows Phone/u,
  ];

  return toMatch.some(toMatchItem => navigator.userAgent.match(toMatchItem));
}

function simulateKeypress(key, type, shiftKey = false, ctrlKey = false) {
  window.dispatchEvent(
    new KeyboardEvent(`key${type}`, { key, shiftKey, ctrlKey })
  );
}

let isMobile;
function loadMobile() {
  isMobile = detectMobile();
}