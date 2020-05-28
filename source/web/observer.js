import {normalize, merge, updateTokens, paragraphTag} from "./normalizer.js";
import {getSelectionOffsets, setSelectionOffsets, insertAtCursor} from "./cursor.js";
import {History} from "./history.js";
import {spellcheck, getParagraphCorrectionSets, setLabelStatus, getTokenLabelUpdater} from "./spellchecker.js";
import {stopCorrecting} from "./corrector.js";
import {
  computeCorrectionStats,
  computeSpellingStats,
  getCorrectionLabels,
  getSpellingLabels
} from "../spelling/stats.js";

const correctionStatsSymbol = Symbol('correction-stats');
const spellingStatsSymbol = Symbol('spelling-stats');

let observer = null;
let container = null;
let statsContainer = null;
let settingsContainer = null;
let coverContainer = null;
let plannedMutationStack = [];

let unmutatedParagraphs = null;

let history = null;

function setCoverState(active) {
  if (active) {
    coverContainer.classList.add('active');
  } else {
    coverContainer.classList.remove('active');
  }
}

function renderStats(labelGetter, statsSymbol) {
  const irrelevantClass = 'stats-irrelevant';
  const paragraphs = [...container.children];
  const labels = labelGetter(paragraphs.map((paragraph) => paragraph[statsSymbol]));
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
}

function renderCorrectionStats() {
  renderStats(getCorrectionLabels, correctionStatsSymbol);
}

function renderSpellingStats() {
  renderStats(getSpellingLabels, spellingStatsSymbol);
}

function processUpdatedRecords(records) {
  if (records === null) { // Initialization call
    return true;
  }
  let treeModified = false;
  records.forEach((record) => {
    if (record.type === 'attributes' && record.target === container) {
      return;
    }
    treeModified = true;
    let node = record.target;
    while (node !== container && node !== null) {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === paragraphTag && unmutatedParagraphs.has(node)) {
        unmutatedParagraphs.delete(node);
      }
      node = node.parentElement;
    }
  });
  return treeModified;
}

function update(records = null, updateHistory = true, removeEmptyMutated = false) {
  if (!processUpdatedRecords(records)) {
    return;
  }
  detachSelectionEvents();
  normalize(container, unmutatedParagraphs);
  const historyItems = [];
  for (const paragraph of [...container.children]) {
    let mutated = !unmutatedParagraphs.has(paragraph);
    if (mutated) {
      if (removeEmptyMutated && paragraph.textContent.trim() === '') {
        paragraph.remove();
        continue;
      }
      unmutatedParagraphs.add(paragraph);
      const tokenData = spellcheck(paragraph, (start, end, replacement) => {
        setSelectionOffsets(paragraph, {start, end});
        insertAtCursor(paragraph, document.createTextNode(replacement));
      });
      merge(paragraph, tokenData);
      paragraph[correctionStatsSymbol] = computeCorrectionStats(getParagraphCorrectionSets(paragraph));
      paragraph[spellingStatsSymbol] = computeSpellingStats(tokenData.map(({token}) => token));
    }
    if (updateHistory) {
      historyItems.push({
        element: paragraph,
        mutated
      });
    }
  }
  if (updateHistory) {
    history.update(historyItems, getSelectionOffsets(container));
  }
  renderCorrectionStats();
  renderSpellingStats();
  setTimeout(() => {
    attachSelectionEvents();
  }, 0);
  observer.takeRecords();
}

function updateForNewLabels() {
  startPlannedMutation();
  for (const paragraph of [...container.children]) {
    updateTokens(paragraph, getTokenLabelUpdater());
    paragraph[correctionStatsSymbol] = computeCorrectionStats(getParagraphCorrectionSets(paragraph));
  }
  renderCorrectionStats();
  endPlannedMutation();
}

function onContentsChanged(records) {
  update(records);
}

function attachPasteEvent() {
  const maxLengthWithoutCover = 1000;
  container.addEventListener('paste', (event) => {
    const text = event.clipboardData.getData('text/plain');
    event.preventDefault();
    const doInsert = () => {
      const contents = new DocumentFragment();
      text.split(/\n/).forEach((line, index, lines) => {
        if (index === 0) {
          const normalized = lines.length > 1 ? line.trim() : line;
          if (normalized !== '') {
            contents.append(document.createTextNode(normalized));
          }
        } else {
          const paragraph = document.createElement(paragraphTag);
          const trimmed = line.trim();
          if (trimmed !== '') {
            paragraph.textContent = trimmed;
            contents.append(paragraph);
          }
        }
      });
      const multiline = contents.childNodes.length > 1;
      startPlannedMutation();
      insertAtCursor(container, contents, multiline);
      const records = endPlannedMutation();
      update(records, true, multiline);
    };
    if (text.length > maxLengthWithoutCover) {
      coverContainer.dataset.type = 'processing';
      setCoverState(true);
      setTimeout(() => {
        doInsert();
        setCoverState(false);
      }, 50); // 0 or even 1 is not enough for most browsers except Chrome
    } else {
      doInsert();
    }
  });
}

function attachHistoryEvents() {
  container.addEventListener('keydown', (event) => {
    let undo = false, redo = false;
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'z') {
        undo = true;
      } else if (event.key === 'Z' || event.key === 'y') {
        redo = true;
      }
    }
    if (undo || redo) {
      event.preventDefault();
      stopCorrecting();
      window.getSelection().removeAllRanges();
      startPlannedMutation();
      const {elements, selection} = undo ? history.undo() : history.redo();
      if (elements.length === 0) {
        container.innerHTML = '';
      } else {
        container.prepend(elements[0]);
        for (let i = 1; i < elements.length; i++) {
          elements[i - 1].after(elements[i]);
        }
        const lastElement = elements[elements.length - 1];
        while (lastElement.nextSibling !== null) {
          lastElement.nextSibling.remove();
        }
      }
      const records = endPlannedMutation();
      update(records, false);
      setSelectionOffsets(container, selection);
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

    const currentSelection = history.getSelection();
    if (delta !== 0 && currentSelection !== null && currentSelection.start === currentSelection.end) {
      const selection = currentSelection.start;
      const node = currentSelection.extraInfo.startContainer;
      setTimeout(() => {
        const currentSelection = history.getSelection();
        if (currentSelection !== null && currentSelection.start === selection && currentSelection.end === selection
          && currentSelection.extraInfo.startContainer === node) {
          const correctSelection = selection + delta;
          if (correctSelection >= 0 && correctSelection <= container.textContent.length) {
            setSelectionOffsets(container, {start: correctSelection, end: correctSelection});
          }
        }
      }, 0);
    }
  });
}

function selectionChanged() {
  history.updateSelection(getSelectionOffsets(container));
}

function attachSelectionEvents() {
  document.addEventListener('selectionchange', selectionChanged);
}

function detachSelectionEvents() {
  document.removeEventListener('selectionchange', selectionChanged);
}

export function startPlannedMutation() {
  plannedMutationStack.push(observer.takeRecords());
}

export function endPlannedMutation() {
  const records = plannedMutationStack.pop();
  return [...records, ...observer.takeRecords()];
}

function watchSettings() {
  settingsContainer.querySelectorAll('input[type=checkbox][data-ignore-label]').forEach((checkbox) => {
    const label = checkbox.dataset.ignoreLabel;
    setLabelStatus(label, checkbox.checked);
    checkbox.addEventListener('change', () => {
      stopCorrecting();
      setLabelStatus(label, checkbox.checked);
      updateForNewLabels();
    });
  });
}

export function attachObserver(inputElement, statsElement, settingsElement, coverElement) {
  container = inputElement;
  statsContainer = statsElement;
  settingsContainer = settingsElement;
  coverContainer = coverElement;
  unmutatedParagraphs = new WeakSet();
  history = new History(paragraphTag);
  observer = new MutationObserver(onContentsChanged);
  observer.observe(inputElement, {
    childList: true,
    characterData: true,
    attributes: true,
    subtree: true
  });
  attachPasteEvent();
  attachSelectionEvents();
  attachHistoryEvents();
  attachCursorFixingEvent();
  watchSettings();
  update();
  setCoverState(false);
}