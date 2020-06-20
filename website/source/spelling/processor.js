import {isWord, isPunctuation, isWhitespace} from "./tokenizer.js";
import {correctionTypes} from "./correction.js";

const correctionTypePriority = [correctionTypes.MISTAKE, correctionTypes.IMPROVEMENT, correctionTypes.UNCERTAIN];

const rules = [];

function registerRule(condition, rule, labels = []) {
  rules.push({condition, rule, labels});
}

export function registerWordRule(rule, labels = []) {
  registerRule(isWord, rule, labels);
}

export function registerPunctuationRule(rule, labels = []) {
  registerRule(isPunctuation, rule, labels);
}

export function registerWhitespaceRule(rule, labels = []) {
  registerRule(isWhitespace, rule, labels);
}

export function processToken(tokenChain) {
  const token = tokenChain.getCurrentToken();
  return rules
    .filter((rule) => rule.condition(token))
    .map((rule) => ({
      correction: rule.rule(token, tokenChain),
      labels: rule.labels
    }))
    .filter(({correction}) => correction !== null)
    .sort(
      (a, b) => correctionTypePriority.indexOf(a.correction.type) - correctionTypePriority.indexOf(b.correction.type)
        || (a.correction.requiresExtraChange ? 1 : 0) - (b.correction.requiresExtraChange ? 1 : 0)
    );
}