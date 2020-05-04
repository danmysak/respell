import {isWhitespace, isWord} from "./tokenizer.js";
import {correctionTypes} from "./types.js";

let correctionStats = null;
let spellingStats = null;

const numberTemplate = '{{number}} {text}'; // With a non-breaking space

const correctionTemplates = {
  [correctionTypes.MISTAKE]: ['жодної помилки', 'помилка', 'помилки', 'помилок'],
  [correctionTypes.IMPROVEMENT]: ['жодної пропозиції', 'пропозиція', 'пропозиції', 'пропозицій'],
  [correctionTypes.UNCERTAIN]: ['жодного припущення', 'припущення', 'припущення', 'припущень']
};

const spellingTemplates = {
  'paragraphs': ['жодного абзацу', 'абзац', 'абзаци', 'абзаців'],
  'sentences': ['жодного речення', 'речення', 'речення', 'речень'],
  'words': ['жодного слова', 'слово', 'слова', 'слів'],
  'characters': ['жодного символу', 'символ', 'символи', 'символів']
};

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

function gatherCumulativeCorrectionStats(applicationSets) {
  const correctionStats = Object.fromEntries(Object.values(correctionTypes).map((type) => [type, 0]));
  for (const set of applicationSets) {
    for (const application of set) {
      if (application !== null) {
        correctionStats[application.type]++;
      }
    }
  }
  return correctionStats;
}

function gatherSpellingStats(tokens) {
  let sentences = 0;
  let words = 0;
  let characters = 0;
  let lastNonSpace = null;
  let lastSentenceHasCapitalizedWords = false;
  tokens.forEach((token) => {
    if (isWord(token)) {
      const isCapitalized = token.match(/^[А-ЯҐЄІЇA-Z]/);
      words++;
      if (lastNonSpace !== null && lastSentenceHasCapitalizedWords &&
        (lastNonSpace.includes('?') || lastNonSpace.includes('!') ||
          (lastNonSpace.includes('.') && token.length > 0 && !token[0].match(/[0-9а-яґєіїa-z]/)))) {
        sentences++;
        lastSentenceHasCapitalizedWords = false;
      }
      lastSentenceHasCapitalizedWords = lastSentenceHasCapitalizedWords || isCapitalized;
    }
    if (isWhitespace(token)) {
      characters++;
    } else {
      characters += token.length;
      lastNonSpace = token;
    }
  });
  if (words > 0 && (lastSentenceHasCapitalizedWords || sentences === 0)) {
    sentences++;
  }
  return {sentences, words, characters};
}

function gatherCumulativeSpellingStats(tokenSets) {
  const cumulativeStats = {
    paragraphs: 0,
    sentences: 0,
    words: 0,
    characters: 0
  };
  for (const set of tokenSets) {
    const setStats = gatherSpellingStats(set);
    if (setStats.sentences > 0) {
      cumulativeStats.paragraphs++;
      cumulativeStats.sentences += setStats.sentences;
      cumulativeStats.words += setStats.words;
      cumulativeStats.characters += setStats.characters;
    }
  }
  return cumulativeStats;
}

export function updateCorrectionStats(applicationSets) {
  correctionStats = gatherCumulativeCorrectionStats(applicationSets);
}

export function updateSpellingStats(tokenSets) {
  spellingStats = gatherCumulativeSpellingStats(tokenSets);
}

function getLabels(templates, stats, includeAverages = false) {
  const labels = {};
  let lastValue = null;
  let lastUnit = null;
  Object.keys(templates).forEach((type) => {
    const value = stats[type];
    const valueType = getNumberType(value);
    const text = templates[type][valueType];
    const label = {};
    if (valueType === numberTypes.ZERO) {
      label.zero = true;
      label.text = text;
    } else {
      label.zero = false;
      label.text = numberTemplate.replace('{number}', value).replace('{text}', text);
    }
    if (includeAverages && value > 0 && lastValue !== null && lastValue > 1) {
      const average = (value / lastValue).toFixed(1).replace('.', ',');
      label.extra = `~${average}/${lastUnit}`;
    }
    labels[type] = label;
    lastValue = value;
    lastUnit = templates[type][numberTypes.ONE];
  });
  return labels;
}

export function getCorrectionLabels() {
  return getLabels(correctionTemplates, correctionStats);
}

export function getSpellingLabels() {
  return getLabels(spellingTemplates, spellingStats, true);
}