import {isWord, isPunctuation, isWhitespace} from "./tokenizer.js";
import {RuleApplication, correctionTypes} from "./types.js";

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
  let currentApplication = null;
  let currentForm = tokenChain.getCurrentToken();
  for (const rule of rules) {
    if (currentApplication !== null && currentApplication.type !== correctionTypes.UNSURE) {
      currentForm = currentApplication.replacement;
    }
    currentApplication = RuleApplication.combine(currentApplication, rule(currentForm, tokenChain));
  }
  return currentApplication;
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