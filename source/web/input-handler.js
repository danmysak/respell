import {paragraphTag} from "./common-tags.js";
import {attachHistoryEvents} from "./events/history.js";
import {attachTabEvent} from "./events/tab.js";
import {attachCursorFixingEvent} from "./events/cursor-fixing.js";
import {attachPasteEvent} from "./events/paste.js";
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
let paragraphs = null;
let unmutatedParagraphs = null;
let history = null;
let plannedMutationStack = [];

function renderStats(labelGetter, statsSymbol) {
  const irrelevantClass = 'stats-irrelevant';
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
  const historyItems = [];
  paragraphs = [];
  for (const paragraph of normalize(container, unmutatedParagraphs)) {
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
    paragraphs.push(paragraph);
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
  for (const paragraph of paragraphs) {
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

function watchSettings(settingCheckboxes) {
  settingCheckboxes.forEach((checkbox) => {
    const label = checkbox.dataset.ignoreLabel;
    setLabelStatus(label, checkbox.checked);
    checkbox.addEventListener('change', () => {
      stopCorrecting();
      setLabelStatus(label, checkbox.checked);
      updateForNewLabels();
    });
  });
}

export function findCorrection(anchorParagraph, condition, ahead = true) {
  const shift = ahead ? 1 : -1;
  let paragraphIndex = paragraphs.indexOf(anchorParagraph);
  while (paragraphIndex >= 0 && paragraphIndex < paragraphs.length) {
    const paragraph = paragraphs[paragraphIndex];
    const data = getParagraphCorrections(paragraph);
    let dataIndex = ahead ? 0 : data.length - 1;
    while (dataIndex >= 0 && dataIndex < data.length) {
      const item = data[dataIndex];
      if (item.corrections.length > 0 && condition(item, paragraph)) {
        return item;
      }
      dataIndex += shift;
    }
    paragraphIndex += shift;
  }
  return null;
}

export function attachObservers(inputElement, statsElement, settingCheckboxes) {
  container = inputElement;
  statsContainer = statsElement;
  unmutatedParagraphs = new WeakSet();
  paragraphs = [];
  history = new History(paragraphTag);
  observer = new MutationObserver(onContentsChanged);
  observer.observe(inputElement, {
    childList: true,
    characterData: true,
    attributes: true,
    subtree: true
  });
  attachHistoryEvents(inputElement, history);
  attachTabEvent(inputElement, settingCheckboxes);
  attachCursorFixingEvent(inputElement, history);
  attachPasteEvent(inputElement);
  attachSelectionEvents();
  watchSettings(settingCheckboxes);
  update();
}