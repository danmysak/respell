import {processToken} from "./storage.js";
import {isWord, isWhitespace} from "./tokenizer.js";
import '../rules/00a.js';
import '../rules/00b.js';
import '../rules/00c.js';

const correctionClass = 'correction';

export const correctionTypes = {
  MISTAKE: 'mistake',
  IMPROVEMENT: 'improvement',
  UNSURE: 'unsure'
};

export class RuleApplication {
  type;
  replacement;
  descriptions;
  get formattedDescriptions() {
    return this.descriptions.map(s => s.replace(/(§) /g, '$1&nbsp;'));
  };

  constructor(type, replacement, description) {
    this.type = type;
    this.replacement = replacement;
    this.descriptions = Array.isArray(description) ? description : [description];
  }

  static merge(a, b) {
    if (a === null || b === null) {
      return a || b;
    }
    if (b.type === correctionTypes.UNSURE) {
      return a;
    } else if (a.type === correctionTypes.UNSURE) {
      return b;
    }
    const type = [a.type, b.type].includes(correctionTypes.MISTAKE)
      ? correctionTypes.MISTAKE : correctionTypes.IMPROVEMENT;
    const replacement = b.replacement;
    const descriptions = [...a.descriptions, ...b.descriptions];
    return new RuleApplication(type, replacement, descriptions);
  }
}

const tokenMap = new WeakMap();

function setCorrectionAttributes(token, correctionType) {
  token.classList.add(correctionClass, `${correctionClass}-${correctionType}`);
  token.tabIndex = 0;
}

function checkToken(token) {
  const application = processToken(token.textContent);
  if (application !== null) {
    setCorrectionAttributes(token, application.type);
  }
  tokenMap.set(token, application);
  return application;
}

export function findNextCorrection(token) {
  let currentParagraph = token.parentElement;
  const siblingCorrections = [...currentParagraph.querySelectorAll(`.${correctionClass}`)];
  const index = siblingCorrections.indexOf(token);
  if (index === -1) {
    return null;
  }
  if (index + 1 < siblingCorrections.length) {
    return siblingCorrections[index + 1];
  }
  while (true) {
    currentParagraph = currentParagraph.nextElementSibling;
    if (currentParagraph === null) {
      return null;
    }
    const correction = currentParagraph.querySelector(`.${correctionClass}`);
    if (correction) {
      return correction;
    }
  }
}

function gatherRawStats(paragraph) {
  let sentences = 0;
  let words = 0;
  let characters = 0;
  let lastNonSpace = null;
  let lastSentenceHasCapitalizedWords = false;
  [...paragraph.children].map(tokenElement => tokenElement.textContent).forEach((token) => {
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

export function spellcheck(inputElement) {
  const rawStats = {
    paragraphs: 0,
    sentences: 0,
    words: 0,
    characters: 0
  };
  const correctionStats = Object.fromEntries(Object.values(correctionTypes).map(type => [type, 0]));
  for (const paragraph of [...inputElement.children]) {
    for (const token of [...paragraph.children]) {
      const application = checkToken(token);
      if (application !== null) {
        correctionStats[application.type]++;
      }
    }
    const paragraphStats = gatherRawStats(paragraph);
    if (paragraphStats.sentences > 0) {
      rawStats.paragraphs++;
      rawStats.sentences += paragraphStats.sentences;
      rawStats.words += paragraphStats.words;
      rawStats.characters += paragraphStats.characters;
    }
  }
  return {
    raw: rawStats,
    corrections: correctionStats
  };
}

export function getTokenRuleApplication(tokenElement) {
  return tokenMap.get(tokenElement) || null;
}