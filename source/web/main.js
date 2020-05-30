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
  const settingCheckboxes = document.querySelectorAll('.settings-container input[type=checkbox][data-ignore-label]');
  const overlay = document.querySelector('.input-overlay');
  inputElement.focus(); // Setting the autofocus attribute doesn't seem to work in Firefox
  registerOverlay(overlay);
  attachObservers(inputElement, statsContainer, settingCheckboxes);
  attachCorrector(inputElement);
  setOverlayState(false);
}