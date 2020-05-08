import {getTokenCorrections, findNextCorrection} from "./spellchecker.js";
import {startPlannedMutation, endPlannedMutation} from "./observer.js";
import {isWhitespace} from "../spelling/tokenizer.js";

export const tooltipTag = 'TOKEN-TOOLTIP';
const correctionContainerTag = 'TOKEN-CORRECTION-CONTAINER';
const replacementTag = 'TOKEN-REPLACEMENT';
const extraChangeTag = 'TOKEN-EXTRA-CHANGE';
const descriptionTag = 'TOKEN-DESCRIPTION';

const tokenCorrectingClassName = 'correction-current';
const containerCorrectingClassName = 'input-correcting';
const containerCorrectingKeyboardClassName = 'input-correcting-keyboard';
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
  container.parentElement.classList.add(containerCorrectingClassName);
  // We put this class on the parent element in order not to trigger an extra change for the input
}

function removeClasses() {
  container.parentElement.classList.remove(containerCorrectingClassName);
  currentToken.classList.remove(tokenCorrectingClassName);
}

function getCorrectionAffixes(prefix, removeToken, getAdjacentSibling) {
  if (removeToken) {
    const sibling = getAdjacentSibling(currentToken);
    if (sibling !== null) {
      if (isWhitespace(sibling.textContent)) {
        const adjacentNonWhitespace = getAdjacentSibling(sibling);
        if (adjacentNonWhitespace !== null) {
          return [
            (prefix ? '' : ' ') + adjacentNonWhitespace.textContent + (prefix ? ' ' : ''),
            adjacentNonWhitespace.textContent
          ];
        }
      }
      return [sibling.textContent, ''];
    }
  }
  return ['', ''];
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
  return text.replace(/(§) /g, '$1&nbsp;').replace(/«-[^»\s]+»/g, '<span class="no-break">$&</span>')
}

function displayTooltip() {
  const tooltip = document.createElement(tooltipTag);
  tooltip.setAttribute('contenteditable', 'false');
  tooltip.tabIndex = -1;
  currentCorrections.forEach((correction, correctionIndex) => {
    const correctionContainer = document.createElement(correctionContainerTag);
    const [oldCorrectionPrefix, newCorrectionPrefix] = getCorrectionAffixes(
      true, correction.removePreviousToken, (element) => element.previousElementSibling
    );
    const [oldCorrectionSuffix, newCorrectionSuffix] = getCorrectionAffixes(
      false, correction.removeNextToken, (element) => element.nextElementSibling
    );
    const replacement = document.createElement(replacementTag);
    replacement.classList.add(`${replacementClassName}-${correction.type}`);
    const oldToken = document.createElement(`${replacementTag}-OLD`);
    oldToken.textContent = oldCorrectionPrefix + currentToken.textContent + oldCorrectionSuffix;
    replacement.append(oldToken);
    const newToken = document.createElement(`${replacementTag}-NEW`);
    [correction.replacement, ...correction.alternatives].forEach((replacement, replacementIndex) => {
      if (replacementIndex > 0) {
        const slash = document.createTextNode(' / ');
        newToken.append(slash);
      }
      const button = document.createElement('button');
      button.innerText = newCorrectionPrefix + replacement + newCorrectionSuffix;
      button.addEventListener('click', () => {
        performReplacement(false, correctionIndex, replacement);
      });
      if (correctionIndex === 0 && replacementIndex === 0) {
        button.classList.add(defaultReplacementClassName);
      }
      newToken.append(button);
    });
    replacement.append(newToken);
    correctionContainer.append(replacement);
    if (correction.requiresExtraChange) {
      const extraChange = document.createElement(extraChangeTag);
      correctionContainer.append(extraChange);
    }
    const description = document.createElement(descriptionTag);
    description.innerHTML = formatDescription(correction.description);
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
  endPlannedMutation(false);
}

export function stopCorrecting() {
  if (!currentToken) {
    return;
  }
  startPlannedMutation();
  detachEvents();
  removeTooltip();
  removeClasses();
  endPlannedMutation(false);
  currentToken = null;
  currentCorrections = null;
}

function checkForRedisplay(token) {
  // We need this for the underline color transition to start from grayed out
  container.parentElement.classList.add(containerCorrectingRedisplayClassName);
  setTimeout(() => {
    if (!currentToken && [...document.querySelectorAll(':hover')].includes(token)) {
      considerCorrecting(token);
    }
    container.parentElement.classList.remove(containerCorrectingRedisplayClassName);
  }, 0);
}

function performReplacement(byKeyboard, index = 0, replacement = null) {
  const token = currentToken;
  const correction = currentCorrections[index];
  stopCorrecting();
  token.textContent = replacement || correction.replacement;
  if (token.previousElementSibling !== null && correction.removePreviousToken) {
    token.previousElementSibling.remove();
  }
  if (token.nextElementSibling !== null && correction.removeNextToken) {
    token.nextElementSibling.remove();
  }
  if (byKeyboard && document.activeElement === token) {
    const correction = findNextCorrection(token);
    if (correction !== null) {
      // We need the following line for the underline color transition to start from grayed out
      container.parentElement.classList.add(containerCorrectingKeyboardClassName);
      setTimeout(() => {
        correction.focus();
        container.parentElement.classList.remove(containerCorrectingKeyboardClassName);
      }, 0);
    }
  }
  checkForRedisplay(token);
}

function onMouseDown(event) {
  if (event.target !== currentToken) {
    return;
  }
  event.preventDefault();
  performReplacement(false);
}

function onKeyDown(event) {
  switch (event.code) {
    case 'Enter':
      event.preventDefault();
      performReplacement(true);
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
  const corrections = getTokenCorrections(element);
  if (corrections === null) {
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
    performReplacement(false);
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