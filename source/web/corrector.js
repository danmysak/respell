import {getTokenCorrectionPresentations, accept} from "./spellchecker.js";
import {startPlannedMutation, endPlannedMutation} from "./observer.js";

const tooltipTag = 'TOKEN-TOOLTIP';
const correctionContainerTag = 'TOKEN-CORRECTION-CONTAINER';
const replacementTag = 'TOKEN-REPLACEMENT';
const extraChangeTag = 'TOKEN-EXTRA-CHANGE';
const descriptionTag = 'TOKEN-DESCRIPTION';

const tokenCorrectingClassName = 'correction-current';
const containerCorrectingClassName = 'input-correcting';
const containerCorrectingRedisplayClassName = 'input-correcting-redisplay';
const replacementClassName = 'replacement';
const defaultReplacementClassName = 'default-replacement';
const tooltipHorizontalShiftProperty = '--tooltip-horizontal-shift';
const tooltipMarginProperty = '--tooltip-margin';

let container = null;
let currentToken = null;
let currentCorrections = null;
let pageBottomPadding = 0;
const tooltipMargin = parseFloat(window.getComputedStyle(document.body).getPropertyValue(tooltipMarginProperty));

function addClasses() {
  currentToken.classList.add(tokenCorrectingClassName);
  container.classList.add(containerCorrectingClassName);
}

function removeClasses() {
  container.classList.remove(containerCorrectingClassName);
  currentToken.classList.remove(tokenCorrectingClassName);
}

function fixTooltipPositioning(tooltip) {
  const boundingRect = tooltip.getBoundingClientRect();
  const heightNeeded = window.scrollY + boundingRect.top + tooltip.offsetHeight + tooltipMargin;
  const currentHeight = document.body.offsetHeight + pageBottomPadding; /* We can't just take the value of
          document.documentElement.scrollHeight because Firefox adds vertical space automatically to accommodate
          the absolutely positioned div, while Chrome doesn't. */
  if (heightNeeded > currentHeight) {
    pageBottomPadding += Math.ceil(heightNeeded - currentHeight);
    document.documentElement.style.paddingBottom = `${pageBottomPadding}px`;
  }
  const leftShift = Math.round(tooltipMargin - boundingRect.left);
  const rightShift = Math.round((boundingRect.left + boundingRect.width + tooltipMargin) - document.body.offsetWidth);
  if (leftShift > 0) { // This can happen on smaller screens
    tooltip.style.setProperty(tooltipHorizontalShiftProperty, `${leftShift}px`);
  } else if (rightShift > 0) {
    tooltip.style.setProperty(tooltipHorizontalShiftProperty, `${-rightShift}px`);
  }
  tooltip.classList.add('animated'); // We need this class, and must set it exactly now, because otherwise the fade-in
                                     // animation would use an outdated value of the tooltipHorizontalShiftProperty.
}

function formatDescription(text) {
  return text
    .replace(/(§) /g, '$1&nbsp;')
    .replace(/ (—)/g, '&nbsp;$1')
    .replace(/«-[^»\s]+»/g, '<span class="no-break">$&</span>')
}

function displayTooltip() {
  const tooltip = document.createElement(tooltipTag);
  tooltip.setAttribute('contenteditable', 'false');
  tooltip.tabIndex = -1;
  currentCorrections.forEach(({id, presentation}, correctionIndex) => {
    const correctionContainer = document.createElement(correctionContainerTag);
    const replacement = document.createElement(replacementTag);
    replacement.classList.add(`${replacementClassName}-${presentation.type}`);
    const oldToken = document.createElement(`${replacementTag}-OLD`);
    oldToken.textContent = presentation.changeFrom;
    replacement.append(oldToken);
    const newToken = document.createElement(`${replacementTag}-NEW`);
    presentation.changeTo.forEach((replacement, replacementIndex) => {
      if (replacementIndex > 0) {
        const slash = document.createTextNode(' / ');
        newToken.append(slash);
      }
      const button = document.createElement('button');
      button.innerText = replacement;
      button.addEventListener('click', () => {
        performReplacement(correctionIndex, replacementIndex);
      });
      if (correctionIndex === 0 && replacementIndex === 0) {
        button.classList.add(defaultReplacementClassName);
      }
      newToken.append(button);
    });
    replacement.append(newToken);
    correctionContainer.append(replacement);
    if (presentation.requiresExtraChange) {
      const extraChange = document.createElement(extraChangeTag);
      correctionContainer.append(extraChange);
    }
    const description = document.createElement(descriptionTag);
    description.innerHTML = formatDescription(presentation.description);
    correctionContainer.append(description);
    tooltip.append(correctionContainer);
  });
  currentToken.append(tooltip);
  fixTooltipPositioning(tooltip);
}

function removeTooltip() {
  currentToken.querySelector(tooltipTag).remove();
}

function startCorrecting(token, corrections) {
  currentToken = token;
  currentCorrections = corrections;
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
  switch (event.code) {
    case 'Enter':
      event.preventDefault();
      performReplacement();
      break;
    case 'Escape':
      event.preventDefault();
      stopCorrecting();
      break;
    default:
      if (event.target.tagName !== tooltipTag) { // Allow the user to copy tooltip text with keyboard
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
  document.addEventListener('keydown', onKeyDown);
  currentToken.addEventListener('mousedown', onMouseDown);
  currentToken.addEventListener('mouseleave', stopCorrecting);
  currentToken.addEventListener('focusout', onFocusOut);
}

function detachEvents() {
  currentToken.removeEventListener('focusout', onFocusOut);
  currentToken.removeEventListener('mouseleave', stopCorrecting);
  currentToken.removeEventListener('mousedown', onMouseDown);
  document.removeEventListener('keydown', onKeyDown);
}

function considerCorrecting(element) {
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
  startCorrecting(element, corrections);
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
  inputElement.addEventListener('focusin', (event) => considerCorrecting(event.target));
  inputElement.addEventListener('touchstart', onTouchStart);
}