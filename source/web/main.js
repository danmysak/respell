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
  const statsContainer = document.querySelector('.stats-container');
  const overlay = document.querySelector('.input-overlay');
  const navigationContainer = document.querySelector('.input-navigation');
  const navigationElements = [
    document.querySelector('.input-navigation-previous'),
    document.querySelector('.input-navigation-next')
  ];
  const settingCheckboxes = document.querySelectorAll('.settings-container input[type=checkbox][data-ignore-label]');
  inputElement.focus(); // Setting the autofocus attribute doesn't seem to work in Firefox
  registerOverlay(overlay);
  attachObservers(inputElement, statsContainer, settingCheckboxes, navigationElements);
  attachCorrector(inputElement, navigationContainer);
  setOverlayState(false);
}