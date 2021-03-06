import {tooltipTag, expanderTag} from "./common-tags.js";
import {getTokenCorrectionPresentations, accept} from "./spellchecker.js";
import {startPlannedMutation, endPlannedMutation} from "./input-handler.js";
import {setCursorAdjacent} from "./cursor.js";
import {
  initializeTooltips,
  createTooltip,
  reportTooltipDisplayed,
  reportTooltipRemoved,
  focusFirstOption
} from "./tooltip.js";

const tokenCorrectingClassName = 'correction-current';
const containerCorrectingClassName = 'input-correcting';
const navigationCorrectingClassName = 'input-navigation-correcting';

let container = null;
let navigationContainer = null;
let currentToken = null;
let currentCorrections = null;
let currentByKeyboard = null;
let mouseLeaveTimeout = null;

function normalizeTarget(element) {
  return element !== null && element.tagName === expanderTag ? element.parentElement : element;
}

function addClasses() {
  currentToken.classList.add(tokenCorrectingClassName);
  container.classList.add(containerCorrectingClassName);
  navigationContainer.classList.add(navigationCorrectingClassName);
}

function removeClasses() {
  navigationContainer.classList.remove(navigationCorrectingClassName);
  container.classList.remove(containerCorrectingClassName);
  currentToken.classList.remove(tokenCorrectingClassName);
}

function displayTooltip() {
  currentToken.append(document.createElement(expanderTag));
  const tooltip = createTooltip(currentCorrections, performReplacement);
  currentToken.append(tooltip);
  reportTooltipDisplayed(tooltip);
  currentToken.tabIndex = -1; // This must be done irrespective of currentByKeyboard because we don't want the user
                              // to be able to focus on the token by shift-tabbing from a button
  if (currentByKeyboard) {
    focusFirstOption(tooltip);
  }
}

function removeTooltip() {
  currentToken.tabIndex = 0;
  currentToken.querySelector(tooltipTag).remove();
  reportTooltipRemoved();
  currentToken.querySelector(expanderTag).remove();
}

function startCorrecting(token, corrections, byKeyboard, byTouch) {
  if (byKeyboard) {
    // This is needed to avoid endless loop with Shift + Tabs when there are some corrections before the last cursor
    // position (it might be useful otherwise as well, but doesn't seem to have any actual effect)
    setCursorAdjacent(token, false);
  }
  if (byTouch) {
    container.blur(); // To avoid having blinking cursor above the tooltip
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

function performReplacement(byKeyboard, correctionIndex = 0, replacementIndex = 0) {
  const token = currentToken;
  const correctionId = currentCorrections[correctionIndex].id;
  stopCorrecting();
  accept(token, correctionId, replacementIndex, byKeyboard);
}

function onMouseDown(event) {
  if (normalizeTarget(event.target) !== currentToken) {
    return;
  }
  event.preventDefault();
  performReplacement(false);
}

function onKeyDown(event) {
  const insideTooltip = () => event.target.closest(tooltipTag) !== null;
  switch (event.code) {
    case 'Enter':
      if (!insideTooltip() || event.target.tagName === tooltipTag) {
        event.preventDefault();
        performReplacement(true);
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
  mouseLeaveTimeout = setTimeout(() => currentToken.addEventListener('mouseleave', stopCorrecting), 0);
  // The timeout is for when mouseleave happens right after mouseover: this is the case when upon displaying of the
  // tooltip, scrollbar immediately shows up and displaces the content
  currentToken.addEventListener('focusout', onFocusOut);
}

function detachEvents() {
  currentToken.removeEventListener('focusout', onFocusOut);
  clearTimeout(mouseLeaveTimeout);
  currentToken.removeEventListener('mouseleave', stopCorrecting);
  currentToken.removeEventListener('mousedown', onMouseDown);
  document.removeEventListener('keydown', onKeyDown, true);
}

function considerCorrecting(element, byKeyboard = false, byTouch = false) {
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
  startCorrecting(element, corrections, byKeyboard, byTouch);
}

function onTouchStart(event) {
  const target = normalizeTarget(event.target);
  if (currentToken === target) {
    event.preventDefault(); // Otherwise browsers can either fire mouse events or not
    performReplacement(false);
  } else {
    const lastToken = currentToken;
    considerCorrecting(target, false, true);
    if (currentToken !== lastToken) {
      event.preventDefault(); // To prevent subsequent firing of mouse events
    } else if (currentToken !== null && !currentToken.contains(target)) {
      stopCorrecting();
    }
  }
}

function onGlobalTouchStart(event) {
  if (!container.contains(event.target)) { // Otherwise onTouchStart will take care of the event
    stopCorrecting();
  }
}

export function attachCorrector(inputElement, navigationElement) {
  initializeTooltips();
  container = inputElement;
  navigationContainer = navigationElement;
  inputElement.addEventListener('mouseover', (event) => considerCorrecting(event.target));
  inputElement.addEventListener('focusin', (event) => considerCorrecting(event.target, true));
  inputElement.addEventListener('touchstart', onTouchStart);
  document.addEventListener('touchstart', onGlobalTouchStart); // We make it a separate handler because otherwise
                             // the 'passive' property should have been fiddled, plus it helps avoid extra checks
}