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

export function processToken(tokenChain, ignoredLabels = []) {
  const token = tokenChain.getCurrentToken();
  const corrections = rules
    .filter((rule) => rule.labels.every((label) => !ignoredLabels.includes(label)) && rule.condition(token))
    .map((rule) => rule.rule(token, tokenChain))
    .filter((correction) => correction !== null)
    .sort((a, b) =>
      correctionTypePriority.indexOf(a.type) - correctionTypePriority.indexOf(b.type)
      || (a.requiresExtraChange ? 1 : 0) - (b.requiresExtraChange ? 1 : 0));
  return corrections.length > 0 ? corrections : null;
}