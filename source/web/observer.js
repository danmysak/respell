import {normalize, normalizeCursorClasses, paragraphTag} from "./normalizer.js";
import {spellcheck} from "./spellchecker.js";
import {tooltipTag, stopCorrecting} from "./corrector.js";
import {updateCorrectionStats, updateSpellingStats, getCorrectionLabels, getSpellingLabels} from "../spelling/stats.js";
import {getRangeIfInside, getParentOffset, getNodeAtOffset, setCursor, insertAtCursor} from "./cursor.js";

let observer = null;
let container = null;
let statsContainer = null;
let settingsContainer = null;
let coverContainer = null;
let plannedMutationStackSize = 0;

let lastContents = null;
let lastSelection = null;
let currentContents = null;
let currentSelection = null;

let ignoredLabels = null;

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
  const start = getParentOffset(container, range.startContainer, range.startOffset);
  const end = range.endContainer === range.startContainer && range.endOffset === range.startOffset
    ? start : getParentOffset(container, range.endContainer, range.endOffset);
  currentSelection = {
    start,
    end
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
  normalize(container, [tooltipTag]);
  setTimeout(() => {
    attachSelectionEvents();
  }, 0);
  updateSnapshots();
  const tokenSets = getTokenSets();
  updateSpellingStats(tokenSets);
  const correctionSets = spellcheck(container, ignoredLabels);
  updateCorrectionStats(correctionSets);
  renderStats();
  observer.takeRecords();
}

function attachPasteEvent() {
  const maxLengthWithoutCover = 1000;
  container.addEventListener('paste', (event) => {
    const text = event.clipboardData.getData('text/plain');
    event.preventDefault();
    const doInsert = () => {
      const contents = new DocumentFragment();
      text.split(/\n/).forEach((line, index) => {
        if (index === 0) {
          contents.append(document.createTextNode(line));
        } else {
          const paragraph = document.createElement(paragraphTag);
          const trimmed = line.trim();
          if (trimmed !== '') {
            paragraph.textContent = trimmed;
            contents.append(paragraph);
          }
        }
      });
      insertAtCursor(contents, container);
    }
    if (text.length > maxLengthWithoutCover) {
      coverContainer.dataset.type = 'processing';
      coverContainer.classList.add('active');
      setTimeout(() => {
        doInsert();
        coverContainer.classList.remove('active');
      }, 50); // 0 or even 1 is not enough for most browsers except Chrome
    } else {
      doInsert();
    }
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
          const end = selectionStart === selectionEnd ? start : getNodeAtOffset(container, selectionEnd);
          setCursor(start.node, start.offset, end.node, end.offset);
        }, 0);
      }
      container.innerHTML = lastContents.map((text) => `<${paragraphTag}>${text}</${paragraphTag}>`).join('');
    }
  });
}

function attachCursorFixingEvent() {
  // Working around the following Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1636248
  container.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
      return;
    }
    let delta = 0;
    switch (event.key) {
      case 'ArrowLeft':
        delta = -1;
        break;
      case 'ArrowRight':
        delta = 1;
        break;
    }
    if (delta !== 0 && currentSelection !== null && currentSelection.start === currentSelection.end) {
      const selection = currentSelection.start;
      setTimeout(() => {
        if (currentSelection !== null && currentSelection.start === selection && currentSelection.end === selection) {
          const correctSelection = selection + delta;
          if (correctSelection >= 0 && correctSelection <= container.textContent.length) {
            const newSelection = getNodeAtOffset(container, correctSelection);
            setCursor(newSelection.node, newSelection.offset);
          }
        }
      }, 0);
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

function watchSettings() {
  ignoredLabels = [];
  settingsContainer.querySelectorAll('input[type=checkbox][data-ignore-label]').forEach((checkbox) => {
    const label = checkbox.dataset.ignoreLabel;
    if (!checkbox.checked) {
      ignoredLabels.push(label);
    }
    checkbox.addEventListener('change', () => {
      const index = ignoredLabels.indexOf(label);
      const doChange = checkbox.checked !== (index === -1);
      if (doChange) {
        if (index >= 0) {
          ignoredLabels.splice(index, 1);
        } else {
          ignoredLabels.push(label);
        }
        contentsChanged();
      }
    });
  });
}

export function attachObserver(inputElement, statsElement, settingsElement, coverElement) {
  container = inputElement;
  statsContainer = statsElement;
  settingsContainer = settingsElement;
  coverContainer = coverElement;
  attachPasteEvent();
  observer = new MutationObserver(contentsChanged);
  observer.observe(inputElement, {
    childList: true,
    characterData: true,
    attributes: true,
    subtree: true
  });
  attachSelectionEvents();
  watchSettings();
  contentsChanged();
  attachUndoEvent();
  attachCursorFixingEvent();
  coverContainer.classList.remove('active');
}