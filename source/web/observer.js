import {paragraphTag} from "./common-tags.js";
import {attachPasteEvent} from "./events/paste.js";
import {attachCursorFixingEvent} from "./events/cursor-fixing.js";
import {attachHistoryEvents} from "./events/history.js";
import {normalize} from "./normalizer.js";
import {merge, updateTokens} from "./merger.js";
import {getSelectionOffsets, setSelectionOffsets, insertAtCursor} from "./cursor.js";
import {History} from "./history.js";
import {spellcheck, getParagraphCorrections, setLabelStatus, getTokenLabelUpdater} from "./spellchecker.js";
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
let unmutatedParagraphs = null;
let history = null;
let plannedMutationStack = [];

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

function setCorrectionStatsData(paragraph) {
  paragraph[correctionStatsSymbol] = computeCorrectionStats(getParagraphCorrections(paragraph));
}

export function update({records = null, updateHistory = true, removeEmptyMutated = false, withAnimations = true} = {}) {
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
      const tokenData = spellcheck(paragraph, withAnimations, (start, end, replacement) => {
        setSelectionOffsets(paragraph, {start, end});
        insertAtCursor(paragraph, document.createTextNode(replacement));
      });
      merge(paragraph, tokenData);
      setCorrectionStatsData(paragraph);
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
    setCorrectionStatsData(paragraph);
  }
  renderCorrectionStats();
  endPlannedMutation();
}

function onContentsChanged(records) {
  update({records});
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

export function attachObserver(inputElement, statsElement, settingsElement) {
  container = inputElement;
  statsContainer = statsElement;
  settingsContainer = settingsElement;
  unmutatedParagraphs = new WeakSet();
  history = new History(paragraphTag);
  observer = new MutationObserver(onContentsChanged);
  observer.observe(inputElement, {
    childList: true,
    characterData: true,
    attributes: true,
    subtree: true
  });
  attachHistoryEvents(inputElement, history);
  attachCursorFixingEvent(inputElement, history);
  attachPasteEvent(inputElement);
  attachSelectionEvents();
  watchSettings();
  update();
}