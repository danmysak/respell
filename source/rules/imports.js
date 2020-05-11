import {Correction, correctionTypes} from "../spelling/types.js";
import {isWord, isWhitespace, isPunctuation, isQuote, canBeSentenceBoundary} from "../spelling/tokenizer.js";
import {registerWordRule, registerPunctuationRule, registerWhitespaceRule} from "../spelling/processor.js";
import {createMaskRule} from "../spelling/masks.js";
import {createTreeRule} from "../spelling/trees.js";
import {
  parenthesizeFirst,
  getLastLetter,
  getConsonants,
  getVowels,
  getSibilants,
  unpackSingleParadigmList,
  unpackDoubleParadigm,
  combineCorrespondences,
  cases,
  determineCase,
  isCapitalized,
  capitalize,
  normalizeCase,
  simplifyApostrophe,
  isAfterSentenceBoundary,
  arrayify
} from "../spelling/utils.js";

export {
  Correction,
  correctionTypes,
  isWord,
  isWhitespace,
  isPunctuation,
  isQuote,
  canBeSentenceBoundary,
  registerWordRule,
  registerPunctuationRule,
  registerWhitespaceRule,
  createMaskRule,
  createTreeRule,
  parenthesizeFirst,
  getLastLetter,
  getConsonants,
  getVowels,
  getSibilants,
  unpackSingleParadigmList,
  unpackDoubleParadigm,
  combineCorrespondences,
  cases,
  determineCase,
  isCapitalized,
  capitalize,
  normalizeCase,
  simplifyApostrophe,
  isAfterSentenceBoundary,
  arrayify
};