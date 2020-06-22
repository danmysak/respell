import {tooltipTag} from "./common-tags.js";
import {introduceNonBreakingSpaces} from "../spelling/typography.js";

const correctionContainerTag = 'TOKEN-CORRECTION-CONTAINER';
const replacementTag = 'TOKEN-REPLACEMENT';
const extraChangeTag = 'TOKEN-EXTRA-CHANGE';
const descriptionTag = 'TOKEN-DESCRIPTION';

const animatedClassName = 'animated';

const replacementClassName = 'replacement';
const defaultReplacementClassName = 'default-replacement';
const tooltipHorizontalShiftProperty = '--tooltip-horizontal-shift';
const tooltipMarginProperty = '--tooltip-margin';

let pageBottomPadding = 0;
const tooltipMargin = parseFloat(window.getComputedStyle(document.body).getPropertyValue(tooltipMarginProperty));

function formatDescription(text) {
  return introduceNonBreakingSpaces(text)
    .replace(/«-[^»\s]+»/g, '<span class="no-break">$&</span>')
}

function formatReplacement(text) {
  return text.replace(/(^\s|\s$)/g, '␣');
}

export function fixTooltipPositioning(tooltip) {
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
  tooltip.classList.add(animatedClassName); // We need this class, and must set it exactly now, because otherwise the
                               // fade-in animation would use an outdated value of the tooltipHorizontalShiftProperty
}

export function createTooltip(currentCorrections, performReplacement) {
  const tooltip = document.createElement(tooltipTag);
  tooltip.setAttribute('contenteditable', 'false');
  tooltip.tabIndex = -1; // This way focus doesn't go out of the token element, and we don't close the tooltip
                         // when user interacts with the tooltip's text
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
      button.innerText = formatReplacement(replacement);
      let byKeyboard = true;
      button.addEventListener('mouseup', () => {
        byKeyboard = false;
      });
      button.addEventListener('click', () => {
        performReplacement(byKeyboard, correctionIndex, replacementIndex);
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
  return tooltip;
}

export function focusFirstOption(tooltip) {
  const defaultButton = tooltip.querySelector(`.${defaultReplacementClassName}`);
  if (defaultButton) { // Unless we have corrections without replacement options, should always be true
    defaultButton.focus();
  }
}