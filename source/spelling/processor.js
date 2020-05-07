import {isWord, isPunctuation, isWhitespace} from "./tokenizer.js";
import {Correction, correctionTypes} from "./types.js";

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

function applyRules(tokenChain, rules) {
  let currentCorrection = null;
  let currentForm = tokenChain.getCurrentToken();
  for (const rule of rules) {
    if (currentCorrection !== null && currentCorrection.type !== correctionTypes.UNCERTAIN) {
      currentForm = currentCorrection.replacement;
    }
    currentCorrection = Correction.combine(currentCorrection, rule(currentForm, tokenChain));
  }
  return currentCorrection;
}

export function processToken(tokenChain) {
  const token = tokenChain.getCurrentToken();
  if (isWord(token)) {
    return applyRules(tokenChain, wordRules);
  } else if (isPunctuation(token)) {
    return applyRules(tokenChain, punctuationRules);
  } else if (isWhitespace(token)) {
    return applyRules(tokenChain, whitespaceRules);
  }
  return null;
}