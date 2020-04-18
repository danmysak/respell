import {isWord} from "./tokenizer.js";
import {RuleApplication} from "./spellchecker.js";

const wordRules = [];

export function registerWordRule(rule) {
  wordRules.push(rule);
}

export function processToken(token) {
  let currentApplication = null;
  if (isWord(token)) {
    for (const rule of wordRules) {
      const currentToken = currentApplication === null ? token : currentApplication.replacement;
      currentApplication = RuleApplication.merge(currentApplication, rule(currentToken));
    }
  }
  return currentApplication;
}