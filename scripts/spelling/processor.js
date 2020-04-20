import {isWord} from "./tokenizer.js";
import {RuleApplication} from "./types.js";

const wordRules = [];

export function registerWordRule(rule) {
  wordRules.push(rule);
}

export function processToken(tokenChain) {
  let currentApplication = null;
  const token = tokenChain.getCurrentToken();
  if (isWord(token)) {
    for (const rule of wordRules) {
      const currentToken = currentApplication === null ? token : currentApplication.replacement;
      currentApplication = RuleApplication.combine(currentApplication, rule(currentToken, tokenChain));
    }
  }
  return currentApplication;
}