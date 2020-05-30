import {attachObserver} from "./observer.js";
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
  const settingsContainer = document.querySelector('.settings-container');
  const overlay = document.querySelector('.input-overlay');
  inputElement.focus(); // Setting the autofocus attribute doesn't seem to work in Firefox
  registerOverlay(overlay);
  attachObserver(inputElement, statsContainer, settingsContainer);
  attachCorrector(inputElement);
  setOverlayState(false);
}