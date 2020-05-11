import {attachObserver} from "./observer.js";
import {attachCorrector} from "./corrector.js";

document.addEventListener('DOMContentLoaded', function() {
  initialize();
});

function initialize() {
  const inputElement = document.querySelector('.input');
  const statsContainer = document.querySelector('.stats-container');
  const settingsContainer = document.querySelector('.settings-container');
  inputElement.focus(); // Setting the autofocus attribute doesn't seem to work in Firefox
  attachObserver(inputElement, statsContainer, settingsContainer);
  attachCorrector(inputElement);
}