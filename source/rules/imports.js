import {RuleApplication, correctionTypes} from "../spelling/types.js";
import {canBeSentenceBoundary, containsQuotes} from "../spelling/tokenizer.js";
import {registerWordRule, registerPunctuationRule, registerWhitespaceRule} from "../spelling/processor.js";
import {createMaskRule} from "../spelling/masks.js";
import {createTreeRule} from "../spelling/trees.js";
import {
  parenthesizeFirst,
  getConsonants,
  getVowels,
  getSibilants,
  unpackParadigm,
  combineCorrespondences,
  cases,
  determineCase,
  isCapitalized,
  capitalize,
  normalizeCase
} from "../spelling/utils.js";

export {
  RuleApplication,
  correctionTypes,
  canBeSentenceBoundary,
  containsQuotes,
  registerWordRule,
  registerPunctuationRule,
  registerWhitespaceRule,
  createMaskRule,
  createTreeRule,
  parenthesizeFirst,
  getConsonants,
  getVowels,
  getSibilants,
  unpackParadigm,
  combineCorrespondences,
  cases,
  determineCase,
  isCapitalized,
  capitalize,
  normalizeCase
};