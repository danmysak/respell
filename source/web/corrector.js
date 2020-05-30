import {tooltipTag} from "./common-tags.js";
import {getTokenCorrectionPresentations, accept} from "./spellchecker.js";
import {startPlannedMutation, endPlannedMutation} from "./input-handler.js";
import {createTooltip, fixTooltipPositioning, focusFirstOption} from "./tooltip.js";
import {setCursorAdjacent} from "./cursor.js";

const tokenCorrectingClassName = 'correction-current';
const containerCorrectingClassName = 'input-correcting';
const containerCorrectingRedisplayClassName = 'input-correcting-redisplay';

let container = null;
let currentToken = null;
let currentCorrections = null;
let currentByKeyboard = null;

function addClasses() {
  currentToken.classList.add(tokenCorrectingClassName);
  container.classList.add(containerCorrectingClassName);
}

function removeClasses() {
  container.classList.remove(containerCorrectingClassName);
  currentToken.classList.remove(tokenCorrectingClassName);
}

function displayTooltip() {
  const tooltip = createTooltip(currentCorrections, performReplacement);
  currentToken.append(tooltip);
  fixTooltipPositioning(tooltip);
  currentToken.tabIndex = -1; // This must be done irrespective of currentByKeyboard because we don't want the user
                              // to be able to focus on the token by shift-tabbing from a button
  if (currentByKeyboard) {
    focusFirstOption(tooltip);
  }
}

function removeTooltip() {
  currentToken.tabIndex = 0;
  currentToken.querySelector(tooltipTag).remove();
}

function startCorrecting(token, corrections, byKeyboard) {
  if (byKeyboard) {
    // This is needed to avoid endless loop with Shift + Tabs when there are some corrections before the last cursor
    // position (it might be useful otherwise as well, but doesn't seem to have any actual effect)
    setCursorAdjacent(token, false);
  }
  currentToken = token;
  currentCorrections = corrections;
  currentByKeyboard = byKeyboard;
  startPlannedMutation();
  addClasses();
  displayTooltip();
  attachEvents();
  endPlannedMutation();
}

export function stopCorrecting() {
  if (!currentToken) {
    return;
  }
  startPlannedMutation();
  detachEvents();
  removeTooltip();
  removeClasses();
  endPlannedMutation();
  currentToken = null;
  currentCorrections = null;
}

function checkForRedisplay(token) {
  // We need this for the underline color transition to start from grayed out
  container.classList.add(containerCorrectingRedisplayClassName);
  setTimeout(() => {
    if (!currentToken && [...document.querySelectorAll(':hover')].includes(token)) {
      considerCorrecting(token);
    }
    container.classList.remove(containerCorrectingRedisplayClassName);
  }, 0);
}

function performReplacement(correctionIndex = 0, replacementIndex = 0) {
  const token = currentToken;
  const correctionId = currentCorrections[correctionIndex].id;
  stopCorrecting();
  accept(token, correctionId, replacementIndex);
  checkForRedisplay(token);
}

function onMouseDown(event) {
  if (event.target !== currentToken) {
    return;
  }
  event.preventDefault();
  performReplacement();
}

function onKeyDown(event) {
  const insideTooltip = () => event.target.closest(tooltipTag) !== null;
  switch (event.code) {
    case 'Enter':
      if (!insideTooltip() || event.target.tagName === tooltipTag) {
        event.preventDefault();
        performReplacement();
      }
      break;
    case 'Escape':
      event.preventDefault();
      const putCursorAfterToken = currentByKeyboard ? currentToken : null;
      stopCorrecting();
      if (putCursorAfterToken) {
        setCursorAdjacent(putCursorAfterToken, true);
      }
      break;
    default:
      if (!insideTooltip()) {
        stopCorrecting();
      }
      break;
  }
}

function onFocusOut(event) {
  if (currentToken !== null && !currentToken.contains(event.relatedTarget)) {
    stopCorrecting();
  }
}

function attachEvents() {
  document.addEventListener('keydown', onKeyDown, true); // This event must fire as early as possible, in particular
                                                         // before the tab listener of the text input
  currentToken.addEventListener('mousedown', onMouseDown);
  currentToken.addEventListener('mouseleave', stopCorrecting);
  currentToken.addEventListener('focusout', onFocusOut);
}

function detachEvents() {
  currentToken.removeEventListener('focusout', onFocusOut);
  currentToken.removeEventListener('mouseleave', stopCorrecting);
  currentToken.removeEventListener('mousedown', onMouseDown);
  document.removeEventListener('keydown', onKeyDown, true);
}

function considerCorrecting(element, byKeyboard = false) {
  const corrections = getTokenCorrectionPresentations(element);
  if (corrections === null || corrections.length === 0) {
    return;
  }
  if (currentToken) {
    if (currentToken === element) {
      return;
    }
    stopCorrecting();
  }
  startCorrecting(element, corrections, byKeyboard);
}

function onTouchStart(event) {
  if (currentToken === event.target) {
    event.preventDefault(); // Otherwise browsers can either fire mouse events or not
    performReplacement();
  } else {
    const lastToken = currentToken;
    considerCorrecting(event.target);
    if (currentToken !== lastToken) {
      event.preventDefault(); // To prevent subsequent firing of mouse events
    } else if (currentToken !== null && !currentToken.contains(event.target)) {
      stopCorrecting();
    }
  }
}

export function attachCorrector(inputElement) {
  container = inputElement;
  inputElement.addEventListener('mouseover', (event) => considerCorrecting(event.target));
  inputElement.addEventListener('focusin', (event) => considerCorrecting(event.target, true));
  inputElement.addEventListener('touchstart', onTouchStart);
}