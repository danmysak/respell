import {isWord, isPunctuation, isWhitespace} from "./tokenizer.js";
import {correctionTypes} from "./types.js";

const correctionTypePriority = [correctionTypes.MISTAKE, correctionTypes.IMPROVEMENT, correctionTypes.UNCERTAIN];

const wordRules = [];
const punctuationRules = [];
const whitespaceRules = [];

export function registerWordRule(rule) {
  wordRules.push(rule);
}

export function registerPunctuationRule(rule) {
  punctuationRules.push(rule);
}

export function registerWhitespaceRule(rule) {
  whitespaceRules.push(rule);
}

export function processToken(tokenChain) {
  const token = tokenChain.getCurrentToken();
  let rules;
  if (isWord(token)) {
    rules = wordRules;
  } else if (isPunctuation(token)) {
    rules = punctuationRules;
  } else if (isWhitespace(token)) {
    rules = whitespaceRules;
  } else {
    return null;
  }
  const corrections = rules
    .map((rule) => rule(token, tokenChain))
    .filter((correction) => correction !== null)
    .sort((a, b) => correctionTypePriority.indexOf(a.type) - correctionTypePriority.indexOf(b.type));
  return corrections.length > 0 ? corrections : null;
}