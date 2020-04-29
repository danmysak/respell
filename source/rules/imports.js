import {RuleApplication, correctionTypes} from "../spelling/types.js";
import {registerWordRule, registerPunctuationRule, registerWhitespaceRule} from "../spelling/processor.js";
import {createMaskRule} from "../spelling/masks.js";
import {createTreeRule} from "../spelling/trees.js";
import {
  parenthesizeFirst,
  canBeSentenceBoundary,
  getConsonants,
  getVowels,
  getSibilants,
  unpackParadigm,
  combineCorrespondences,
  cases,
  determineCase,
  isCapitalized,
  normalizeCase
} from "../spelling/utils.js";

export {
  RuleApplication,
  correctionTypes,
  registerWordRule,
  registerPunctuationRule,
  registerWhitespaceRule,
  createMaskRule,
  createTreeRule,
  parenthesizeFirst,
  canBeSentenceBoundary,
  getConsonants,
  getVowels,
  getSibilants,
  unpackParadigm,
  combineCorrespondences,
  cases,
  determineCase,
  isCapitalized,
  normalizeCase
};