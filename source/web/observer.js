import {normalize, normalizeCursorClasses, paragraphTag} from "./normalizer.js";
import {spellcheck} from "./spellchecker.js";
import {tooltipTag, stopCorrecting} from "./corrector.js";
import {updateCorrectionStats, updateSpellingStats, getCorrectionLabels, getSpellingLabels} from "../spelling/stats.js";
import {getRangeIfInside, getParentOffset, getNodeAtOffset, setCursor} from "./cursor.js";

let observer = null;
let container = null;
let statsContainer = null;
let isPasting = false;
let plannedMutationStackSize = 0;

let lastContents = null;
let lastSelection = null;
let currentContents = null;
let currentSelection = null;

function renderStats() {
  const irrelevantClass = 'stats-irrelevant';
  const render = (labels) => {
    for (const type of Object.keys(labels)) {
      const label = labels[type];
      const element = statsContainer.querySelector(`.stats-${type}`);
      const html = [];
      html.push(label.text.replace(/{(.*)}/, '<strong>$1</strong>'));
      if (label.extra) {
        html.push(`<aside class="stats-extra">${label.extra}</aside>`);
      }
      element.innerHTML = html.join('');
      if (label.zero) {
        element.classList.add(irrelevantClass);
      } else {
        element.classList.remove(irrelevantClass);
      }
    }
  };
  render(getCorrectionLabels());
  render(getSpellingLabels());
}

function updateCurrentSelection() {
  const range = getRangeIfInside(container);
  if (range === null) {
    return null;
  }
  currentSelection = {
    start: getParentOffset(container, range.startContainer, range.startOffset),
    end: getParentOffset(container, range.endContainer, range.endOffset)
  };
}

function updateSnapshots() {
  lastContents = currentContents;
  lastSelection = currentSelection;
  currentContents = [...container.children].map((paragraph) => paragraph.textContent);
  updateCurrentSelection();
}

function getTokenSets() {
  return [...container.children].map((paragraph) => [...paragraph.children].map((child) => child.textContent));
}

function contentsChanged() {
  detachSelectionEvents();
  normalize(container, [tooltipTag], isPasting);
  setTimeout(() => {
    attachSelectionEvents();
  }, 0);
  updateSnapshots();
  const tokenSets = getTokenSets();
  updateSpellingStats(tokenSets);
  const applicationSets = spellcheck(container);
  updateCorrectionStats(applicationSets);
  renderStats();
  observer.takeRecords();
}

function attachPasteEvent() {
  container.addEventListener('paste', () => {
    isPasting = true;
    setTimeout(() => {
      isPasting = false;
    }, 0);
  });
}

function attachUndoEvent() {
  container.addEventListener('keydown', (event) => {
    if (lastContents !== null && (['z', 'y'].includes(event.key.toLowerCase())) && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      stopCorrecting();
      window.getSelection().removeAllRanges();
      if (lastSelection !== null) {
        const selectionStart = lastSelection.start;
        const selectionEnd = lastSelection.end;
        setTimeout(() => {
          const start = getNodeAtOffset(container, selectionStart);
          const end = getNodeAtOffset(container, selectionEnd);
          setCursor(start.node, start.offset, end.node, end.offset);
        }, 0);
      }
      container.innerHTML = lastContents.map((text) => `<${paragraphTag}>${text}</${paragraphTag}>`).join('');
    }
  });
}

function selectionChanged() {
  updateCursorClasses();
  updateCurrentSelection();
}

function attachSelectionEvents() {
  document.addEventListener('selectionchange', selectionChanged);
}

function detachSelectionEvents() {
  document.removeEventListener('selectionchange', selectionChanged);
}

export function startPlannedMutation() {
  plannedMutationStackSize++;
  if (plannedMutationStackSize > 1) {
    return;
  }
  const list = observer.takeRecords();
  if (list.length > 0) {
    contentsChanged(list);
  }
}

export function endPlannedMutation(updateCursorClasses = true) {
  plannedMutationStackSize--;
  if (plannedMutationStackSize > 0) {
    return;
  }
  if (updateCursorClasses) {
    normalizeCursorClasses(container);
  }
  observer.takeRecords();
}

function updateCursorClasses() {
  startPlannedMutation();
  endPlannedMutation(true);
}

export function attachObserver(inputElement, statsElement) {
  container = inputElement;
  statsContainer = statsElement;
  attachPasteEvent();
  observer = new MutationObserver(contentsChanged);
  observer.observe(inputElement, {
    childList: true,
    characterData: true,
    attributes: true,
    subtree: true
  });
  attachSelectionEvents();
  contentsChanged();
  attachUndoEvent();
}