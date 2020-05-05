import {getTokenRuleApplication, findNextCorrection} from "./spellchecker.js";
import {startPlannedMutation, endPlannedMutation} from "./observer.js";
import {isWhitespace} from "../spelling/tokenizer.js";

export const tooltipTag = 'TOKEN-TOOLTIP';
const replacementTag = 'TOKEN-REPLACEMENT';
const extraChangeTag = 'TOKEN-EXTRA-CHANGE';
const descriptionsTag = 'TOKEN-DESCRIPTIONS';
const descriptionTag = 'TOKEN-DESCRIPTION';

const tokenCorrectingClassName = 'correction-current';
const containerCorrectingClassName = 'correcting';
const tooltipHorizontalShiftProperty = '--tooltip-horizontal-shift';
const tooltipMarginProperty = '--tooltip-margin';

let container = null;
let currentToken = null;
let currentApplication = null;
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

function getCorrectionPrefixes() {
  if (currentApplication.removeWhitespaceBefore) {
    const previous = currentToken.previousElementSibling;
    if (previous !== null && isWhitespace(previous.textContent) !== null) {
      const previousNonWhitespace = previous.previousElementSibling;
      if (previousNonWhitespace !== null) {
        return [previousNonWhitespace.textContent + ' ', previousNonWhitespace.textContent];
      }
    }
  }
  if (currentApplication.removePreviousToken) {
    const previous = currentToken.previousElementSibling;
    if (previous !== null) {
      return [previous.textContent, ''];
    }
  }
  return ['', ''];
}

function getCorrectionSuffixes() {
  if (currentApplication.removeNextToken) {
    const next = currentToken.nextElementSibling;
    if (next !== null) {
      return [next.textContent, ''];
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
  const [oldCorrectionPrefix, newCorrectionPrefix] = getCorrectionPrefixes();
  const [oldCorrectionSuffix, newCorrectionSuffix] = getCorrectionSuffixes();
  const replacement = document.createElement(replacementTag);
  const oldToken = document.createElement(`${replacementTag}-OLD`);
  oldToken.textContent = oldCorrectionPrefix + currentToken.textContent + oldCorrectionSuffix;
  replacement.append(oldToken);
  const newToken = document.createElement(`${replacementTag}-NEW`);
  newToken.textContent = [currentApplication.replacement, ...currentApplication.alternatives]
    .map((replacement) => newCorrectionPrefix + replacement + newCorrectionSuffix).join(' / ');
  replacement.append(newToken);
  tooltip.append(replacement);
  if (currentApplication.requiresExtraChange) {
    const extraChange = document.createElement(extraChangeTag);
    tooltip.append(extraChange);
  }
  const descriptions = document.createElement(descriptionsTag);
  currentApplication.descriptions.forEach((text) => {
    const description = document.createElement(descriptionTag);
    description.innerHTML = formatDescription(text);
    descriptions.append(description);
  });
  tooltip.append(descriptions);
  currentToken.append(tooltip);
  fixTooltipPositioning(tooltip);
}

function removeTooltip() {
  currentToken.querySelector(tooltipTag).remove();
}

function startCorrecting(token, ruleApplication) {
  currentToken = token;
  currentApplication = ruleApplication;
  startPlannedMutation();
  addClasses();
  displayTooltip();
  attachEvents();
  endPlannedMutation();
}

function stopCorrecting() {
  if (!currentToken) {
    return;
  }
  startPlannedMutation();
  detachEvents();
  removeTooltip();
  removeClasses();
  endPlannedMutation();
  currentToken = null;
  currentApplication = null;
}

function performReplacement(byKeyboard) {
  const token = currentToken;
  const application = currentApplication;
  stopCorrecting();
  token.textContent = application.replacement;
  if (token.previousElementSibling !== null && (application.removePreviousToken
    || (application.removeWhitespaceBefore && isWhitespace(token.previousElementSibling.textContent)))) {
    token.previousElementSibling.remove();
  }
  if (token.nextElementSibling !== null && application.removeNextToken) {
    token.nextElementSibling.remove();
  }
  if (byKeyboard && document.activeElement === token) {
    const correction = findNextCorrection(token);
    if (correction !== null) {
      // We need the following line in order for the underline color transition to start from grayed out
      container.classList.add(containerCorrectingClassName);
      setTimeout(() => {
        correction.focus();
      }, 0);
    }
  }
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
      stopCorrecting();
      break;
  }
}

function attachEvents() {
  document.addEventListener('keydown', onKeyDown);
  currentToken.addEventListener('mousedown', onMouseDown);
  currentToken.addEventListener('mouseleave', stopCorrecting);
  currentToken.addEventListener('focusout', stopCorrecting);
}

function detachEvents() {
  currentToken.removeEventListener('focusout', stopCorrecting);
  currentToken.removeEventListener('mouseleave', stopCorrecting);
  currentToken.removeEventListener('mousedown', onMouseDown);
  document.removeEventListener('keydown', onKeyDown);
}

function considerCorrecting(event) {
  const element = event.target;
  const application = getTokenRuleApplication(element);
  if (application === null) {
    return;
  }
  if (currentToken) {
    if (currentToken === element) {
      return;
    }
    stopCorrecting();
  }
  startCorrecting(element, application);
}

function onTouchStart(event) {
  if (currentToken === event.target) {
    event.preventDefault(); // Otherwise browsers can either fire mouse events or not
    performReplacement(false);
  } else {
    const lastToken = currentToken;
    considerCorrecting(event);
    if (currentToken !== lastToken) {
      event.preventDefault(); // To prevent subsequent firing of mouse events
    } else if (currentToken !== null && !currentToken.contains(event.target)) {
      stopCorrecting();
    }
  }
}

export function attachCorrector(inputElement) {
  container = inputElement;
  inputElement.addEventListener('mouseover', considerCorrecting);
  inputElement.addEventListener('focusin', considerCorrecting);
  inputElement.addEventListener('touchstart', onTouchStart);
}