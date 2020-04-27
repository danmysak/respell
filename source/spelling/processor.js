import {isWord} from "./tokenizer.js";
import {RuleApplication, correctionTypes} from "./types.js";

const wordRules = [];

export function registerWordRule(rule) {
  wordRules.push(rule);
}

export function processToken(tokenChain) {
  let currentApplication = null;
  const token = tokenChain.getCurrentToken();
  let currentForm = token;
  if (isWord(token)) {
    for (const rule of wordRules) {
      if (currentApplication !== null && currentApplication.type !== correctionTypes.UNSURE) {
        currentForm = currentApplication.replacement;
      }
      currentApplication = RuleApplication.combine(currentApplication, rule(currentForm, tokenChain));
    }
  }
  return currentApplication;
}