import {normalize, normalizeCursorClasses} from "./normalizer.js";
import {spellcheck, correctionTypes} from "../spellcheck/spellchecker.js";
import {tooltipTag} from "./corrector.js";

let observer = null;
let container = null;
let statsContainer = null;
let isPasting = false;
let plannedMutationStackSize = 0;

const numberTypes = {
  ZERO: 0,
  ONE: 1,
  FEW: 2,
  MANY: 3
};

function getNumberType(number) {
  if (number === 0) {
    return numberTypes.ZERO;
  }
  const lastTwo = number % 100;
  if (lastTwo >= 10 && lastTwo < 20) {
    return numberTypes.MANY;
  }
  const last = number % 10;
  if (last === 1) {
    return numberTypes.ONE;
  }
  if (last >= 2 && last <= 4) {
    return numberTypes.FEW;
  }
  return numberTypes.MANY;
}

function updateStats(stats) {
  const irrelevantClass = 'stats-irrelevant';
  const correctionTemplates = {
    [correctionTypes.MISTAKE]: ['жодної помилки', 'помилка', 'помилки', 'помилок'],
    [correctionTypes.IMPROVEMENT]: ['жодної пропозиції', 'пропозиція', 'пропозиції', 'пропозицій'],
    [correctionTypes.UNSURE]: ['жодного припущення', 'припущення', 'припущення', 'припущень']
  };
  const rawTemplates = {
    'paragraphs': ['жодного абзацу', 'абзац', 'абзаци', 'абзаців'],
    'sentences': ['жодного речення', 'речення', 'речення', 'речень'],
    'words': ['жодного слова', 'слово', 'слова', 'слів'],
    'characters': ['жодного символу', 'символ', 'символи', 'символів']
  };
  const updateWithTemplates = (templates, stats, includeAverages = false) => {
    let lastValue = null;
    let lastUnit = null;
    Object.keys(templates).forEach((type) => {
      const element = statsContainer.querySelector(`.stats-${type}`);
      const value = stats[type];
      const valueType = getNumberType(value);
      const html = [];
      html.push(`${value > 0 ? `<strong>${value}</strong>&nbsp;` : ''}${templates[type][valueType]}`);
      if (includeAverages && value > 0 && lastValue !== null && lastValue > 1) {
        const average = (value / lastValue).toFixed(1).replace('.', ',');
        html.push(`<aside class="stats-extra">~${average}/${lastUnit}</aside>`);
      }
      element.innerHTML = html.join('');
      if (valueType === numberTypes.ZERO) {
        element.classList.add(irrelevantClass);
      } else {
        element.classList.remove(irrelevantClass);
      }
      lastValue = value;
      lastUnit = templates[type][numberTypes.ONE];
    });
  };
  updateWithTemplates(correctionTemplates, stats.corrections);
  updateWithTemplates(rawTemplates, stats.raw, true);
}

function contentsChanged() {
  normalize(container, [tooltipTag], isPasting);
  const stats = spellcheck(container);
  updateStats(stats);
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