import {attachObserver} from "./observer.js";
import {attachCorrector} from "./corrector.js";

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  const inputElement = document.querySelector('.input');
  const statsContainer = document.querySelector('.stats-container');
  const settingsContainer = document.querySelector('.settings-container');
  const cover = document.querySelector('.input-cover');
  inputElement.focus(); // Setting the autofocus attribute doesn't seem to work in Firefox
  attachObserver(inputElement, statsContainer, settingsContainer, cover);
  attachCorrector(inputElement);
}