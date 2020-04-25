import {normalize, normalizeCursorClasses} from "./normalizer.js";
import {spellcheck} from "./spellchecker.js";
import {tooltipTag} from "./corrector.js";
import {updateCorrectionStats, updateSpellingStats, getCorrectionLabels, getSpellingLabels} from "../spelling/stats.js";

let observer = null;
let container = null;
let statsContainer = null;
let isPasting = false;
let plannedMutationStackSize = 0;

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

function contentsChanged() {
  normalize(container, [tooltipTag], isPasting);
  const tokenSets = [...container.children]
    .map((paragraph) => [...paragraph.children].map((child) => child.textContent));
  updateSpellingStats(tokenSets);
  const applicationSets = spellcheck(container);
  updateCorrectionStats(applicationSets);
  renderStats();
  observer.takeRecords();
}

function attachPasteEvent(inputElement) {
  inputElement.addEventListener('paste', () => {
    isPasting = true;
    setTimeout(() => {
      isPasting = false;
    }, 0);
  });
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

function actualizeCursorClasses() {
  startPlannedMutation();
  endPlannedMutation(true);
}

export function attachObserver(inputElement, statsElement) {
  container = inputElement;
  statsContainer = statsElement;
  attachPasteEvent(inputElement);
  observer = new MutationObserver(contentsChanged);
  observer.observe(inputElement, {
    childList: true,
    characterData: true,
    attributes: true,
    subtree: true
  });
  contentsChanged();
  document.addEventListener('selectionchange', actualizeCursorClasses);
}