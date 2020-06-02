import {getParagraphs, findCorrection} from "../input-handler.js";

const debounceTime = 50; // In milliseconds
const extraBuffer = 4; // In pixels

const buttonSelector = 'button';
const activeClassName = 'active';
const hiddenClassName = 'hidden';

let container = null;
let previousContainer = null;
let nextContainer = null;

let textLineHeight = null;
let previousHeight = null;
let nextHeight = null;

let visibilityUpdateScheduled = false;

function visibilityUpdate() {
  const rect = container.getBoundingClientRect();
  if (rect.top >= 0) {
    previousContainer.classList.add(hiddenClassName)
  } else {
    previousContainer.classList.remove(hiddenClassName);
  }
  if (rect.bottom < document.documentElement.clientHeight) {
    nextContainer.classList.add(hiddenClassName);
  } else {
    nextContainer.classList.remove(hiddenClassName);
  }
  visibilityUpdateScheduled = false;
}

function getBuffer() {
  return textLineHeight + extraBuffer;
}

function getStatus(element) {
  const rect = element.getBoundingClientRect();
  if (rect.bottom <= 0) {
    return -1; // Fully above viewport
  }
  if (rect.top >= document.documentElement.clientHeight) {
    return 1; // Fully below viewport
  }
  return 0; // Partially visible
}

function findPartiallyVisibleIndex(paragraphs) {
  if (paragraphs.length === 0) {
    return null;
  }
  let start = 0;
  let startStatus = getStatus(paragraphs[start]);
  if (startStatus > 0) {
    return null;
  } else if (startStatus === 0) {
    return start;
  }
  let end = paragraphs.length - 1;
  let endStatus = getStatus(paragraphs[end]);
  if (endStatus < 0) {
    return null;
  } else if (endStatus === 0) {
    return end;
  }
  while (true) {
    const middle = Math.floor((start + end) / 2);
    if (middle === start || middle === end) {
      return middle; // Shouldn't happen, unless gaps between paragraphs are larger or equal to the viewport height
    }
    const middleStatus = getStatus(paragraphs[middle]);
    if (middleStatus === 0) {
      return middle;
    }
    if (middleStatus < 0) {
      start = middle;
      startStatus = middleStatus;
    } else {
      end = middle;
      endStatus = middleStatus;
    }
  }
}

function isPartiallyAboveViewport(element, extraTopTrim = 0) {
  return element.getBoundingClientRect().top < extraTopTrim;
}

function isPartiallyBelowViewport(element, extraBottomTrim = 0) {
  return element.getBoundingClientRect().bottom > document.documentElement.clientHeight - extraBottomTrim;
}

function mainUpdate() {
  const rect = container.getBoundingClientRect();
  const viewPortHeight = document.documentElement.clientHeight;
  const visibleHeight = Math.min(rect.bottom, viewPortHeight) - Math.max(rect.top, 0);
  const enoughSpace = visibleHeight > previousHeight + nextHeight + getBuffer() * 2 + textLineHeight;
  const paragraphs = getParagraphs();
  const index = findPartiallyVisibleIndex(paragraphs);
  const process = (container, ahead, conditionChecker) => {
    if (enoughSpace && index !== null
      && findCorrection(index, ({element}) => conditionChecker(element), ahead) !== null) {
      container.classList.add(activeClassName);
    } else {
      container.classList.remove(activeClassName);
    }
  };
  process(nextContainer, true, isPartiallyBelowViewport);
  process(previousContainer, false, isPartiallyAboveViewport);
}

function scroll(ahead) {
  const paragraphs = getParagraphs();
  const index = findPartiallyVisibleIndex(paragraphs);
  if (index === null) {
    return;
  }
  const conditionChecker = ahead ? isPartiallyBelowViewport : isPartiallyAboveViewport;
  const correction = findCorrection(
    index, ({element}) => conditionChecker(element, ahead ? nextHeight : previousHeight), ahead
  );
  if (correction === null) { // Might happen when the user clicks within debounceTime before the control is hidden
    return;
  }
  const rect = correction.element.getBoundingClientRect();
  const amount = ahead
    ? rect.top - previousHeight - getBuffer()
    : rect.bottom + nextHeight + getBuffer() - document.documentElement.clientHeight;
  window.scrollTo({
    left: window.pageXOffset,
    top: window.pageYOffset + amount,
    behavior: 'smooth'
  });
}

function fullUpdate() {
  visibilityUpdate();
  mainUpdate();
}

export function triggerNavigationEvents() {
  setTimeout(fullUpdate, 0);
}

export function attachNavigationEvents(inputElement, [previous, next]) {
  container = inputElement;
  previousContainer = previous;
  nextContainer = next;
  textLineHeight = parseFloat(window.getComputedStyle(inputElement).getPropertyValue('line-height'));
  previousHeight = parseFloat(window.getComputedStyle(previous).getPropertyValue('height'));
  nextHeight = parseFloat(window.getComputedStyle(next).getPropertyValue('height'));
  let timer = setTimeout(fullUpdate, 0);
  const reset = () => {
    if (!visibilityUpdateScheduled) {
      visibilityUpdateScheduled = true;
      setTimeout(visibilityUpdate, 0);
    }
    clearTimeout(timer);
    timer = setTimeout(fullUpdate, debounceTime);
  };
  window.addEventListener('resize', reset);
  window.addEventListener('scroll', reset);
  previous.querySelector(buttonSelector).addEventListener('click', () => scroll(false));
  next.querySelector(buttonSelector).addEventListener('click', () => scroll(true));
}