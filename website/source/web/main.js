import {attachObservers} from "./input-handler.js";
import {attachCorrector} from "./corrector.js";
import {registerOverlay, setOverlayState} from "./overlay.js";

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  const inputElement = document.querySelector('.input');
  const inputStore = document.querySelector('.input-store');
  const statsContainer = document.querySelector('.stats-container');
  const overlay = document.querySelector('.input-overlay');
  const navigationContainer = document.querySelector('.input-navigation');
  const navigationElements = [
    document.querySelector('.input-navigation-previous'),
    document.querySelector('.input-navigation-next')
  ];
  const settingCheckboxes = document.querySelectorAll('.settings-container input[type=checkbox][data-ignore-label]');
  if (!window.matchMedia("(pointer: coarse)").matches) {
    // On touch screens this is useless and can cause annoying scrolls
    inputElement.focus();
  }
  registerOverlay(overlay);
  attachObservers(inputElement, inputStore, statsContainer, settingCheckboxes, navigationElements);
  attachCorrector(inputElement, navigationContainer);
  document.querySelectorAll('.explanation').forEach((element) => element.addEventListener('touchend', (event) => {
    if (event.cancelable) {
      event.preventDefault();
    }
  }));
  setOverlayState(false);
}