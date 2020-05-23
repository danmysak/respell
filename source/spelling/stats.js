import {isWhitespace, isWord} from "./tokenizer.js";
import {correctionTypes} from "./correction.js";

let correctionStats = null;
let spellingStats = null;

const numberTemplate = '{{number}} {text}'; // With a non-breaking space

const correctionTemplates = {
  [correctionTypes.MISTAKE]: {
    labels: ['жодної помилки', 'помилка', 'помилки', 'помилок']
  },
  [correctionTypes.IMPROVEMENT]: {
    labels: ['жодної пропозиції', 'пропозиція', 'пропозиції', 'пропозицій']
  },
  [correctionTypes.UNCERTAIN]: {
    labels: ['жодного припущення', 'припущення', 'припущення', 'припущень']
  }
};

const spellingTemplates = {
  'paragraphs': {
    labels: ['жодного абзацу', 'абзац', 'абзаци', 'абзаців']
  },
  'sentences': {
    labels: ['жодного речення', 'речення', 'речення', 'речень'],
    average: {
      denominator: 'paragraphs',
      label: 'абзац'
    }
  },
  'words': {
    labels: ['жодного слова', 'слово', 'слова', 'слів'],
    average: {
      denominator: 'sentences',
      label: 'речення'
    }
  },
  'characters': {
    labels: ['жодного символу', 'символ', 'символи', 'символів'],
    average: {
      numerator: 'wordCharacters',
      denominator: 'words',
      label: 'слово'
    }
  }
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

function gatherCumulativeCorrectionStats(correctionSets) {
  const correctionStats = Object.fromEntries(Object.values(correctionTypes).map((type) => [type, 0]));
  for (const set of correctionSets) {
    for (const corrections of set) {
      if (corrections !== null) {
        correctionStats[corrections[0].type]++;
      }
    }
  }
  return correctionStats;
}

function gatherSpellingStats(tokens) {
  let sentences = 0;
  let words = 0;
  let characters = 0;
  let wordCharacters = 0;
  let lastNonSpace = null;
  let lastSentenceHasCapitalizedWords = false;
  tokens.forEach((token) => {
    if (isWord(token)) {
      words++;
      wordCharacters += token.length;
      const isCapitalized = token.match(/^[А-ЯҐЄІЇA-Z]/);
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
  return {sentences, words, characters, wordCharacters};
}

function gatherCumulativeSpellingStats(tokenSets) {
  const cumulativeStats = {
    paragraphs: 0,
    sentences: 0,
    words: 0,
    characters: 0,
    wordCharacters: 0
  };
  for (const set of tokenSets) {
    const setStats = gatherSpellingStats(set);
    if (setStats.sentences > 0) {
      cumulativeStats.paragraphs++;
      cumulativeStats.sentences += setStats.sentences;
      cumulativeStats.words += setStats.words;
      cumulativeStats.characters += setStats.characters;
      cumulativeStats.wordCharacters += setStats.wordCharacters;
    }
  }
  return cumulativeStats;
}

export function updateCorrectionStats(correctionSets) {
  correctionStats = gatherCumulativeCorrectionStats(correctionSets);
}

export function updateSpellingStats(tokenSets) {
  spellingStats = gatherCumulativeSpellingStats(tokenSets);
}

function getLabels(templates, stats) {
  const labels = {};
  Object.keys(templates).forEach((type) => {
    const template = templates[type];
    const value = stats[type];
    const valueType = getNumberType(value);
    const text = template.labels[valueType];
    const label = {};
    if (valueType === numberTypes.ZERO) {
      label.zero = true;
      label.text = text;
    } else {
      label.zero = false;
      label.text = numberTemplate.replace('{number}', value).replace('{text}', text);
    }
    if (template.average) {
      const numerator = stats[template.average.numerator || type];
      const denominator = stats[template.average.denominator];
      if (numerator > 0 && denominator > 1) {
        const average = (numerator / denominator).toFixed(1).replace('.', ',');
        label.extra = `~${average}/${template.average.label}`;
      }
    }
    labels[type] = label;
  });
  return labels;
}

export function getCorrectionLabels() {
  return getLabels(correctionTemplates, correctionStats);
}

export function getSpellingLabels() {
  return getLabels(spellingTemplates, spellingStats);
}