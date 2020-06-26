import {labels} from "../includes/labels.js";
import {cases, number, nominalForms, frequency, groups} from "../includes/grammar.js";
import {letterCases} from "../includes/typography.js";
import {Correction, correctionTypes} from "../spelling/correction.js";
import {
  isWord,
  isWhitespace,
  isPunctuation,
  isQuote,
  isSlash,
  isDash,
  canBeSentenceBoundary
} from "../spelling/tokenizer.js";
import {registerWordRule, registerPunctuationRule, registerWhitespaceRule} from "../spelling/processor.js";
import {createMaskRule} from "../spelling/masks.js";
import {createTreeRule, treeWildcardCharacter} from "../spelling/trees.js";
import {decliners} from "../spelling/decliners.js";
import {
  isAfterSentenceBoundary,
  getCompatibleNominalForms,
  isArabicNumeral,
  isRomanNumeral
} from "../spelling/helpers.js";
import {
  getGroup,
  getConsonants,
  getVowels,
  getVelars,
  getHushing,
  getHissing,
  getSibilants,
  getCoronals,
  getSoft
} from "../spelling/phonetics.js";
import {
  unpackSingleParadigmList,
  unpackDoubleParadigm,
  combineCorrespondences,
  unique,
  arrayify
} from "../spelling/data-manipulation.js";
import {
  parenthesizeFirst,
  getFirstLetter,
  getLastLetter,
  determineLetterCase,
  isCapitalized,
  capitalize,
  makeLowerCaseIfNotUppercase,
  setCase,
  normalizeCase,
  simplifyApostrophe
} from "../spelling/typography.js";

export {
  labels,
  cases,
  number,
  nominalForms,
  frequency,
  groups,
  letterCases,

  correctionTypes,
  Correction,
  registerWordRule,
  registerPunctuationRule,
  registerWhitespaceRule,
  createMaskRule,
  createTreeRule,
  treeWildcardCharacter,
  isWord,
  isWhitespace,
  isPunctuation,
  isQuote,
  isSlash,
  isDash,
  canBeSentenceBoundary,

  isAfterSentenceBoundary,
  getCompatibleNominalForms,
  isArabicNumeral,
  isRomanNumeral,

  decliners,

  getGroup,
  getConsonants,
  getVowels,
  getVelars,
  getHushing,
  getHissing,
  getSibilants,
  getCoronals,
  getSoft,

  parenthesizeFirst,
  getFirstLetter,
  getLastLetter,
  determineLetterCase,
  isCapitalized,
  capitalize,
  makeLowerCaseIfNotUppercase,
  setCase,
  normalizeCase,
  simplifyApostrophe,

  unpackSingleParadigmList,
  unpackDoubleParadigm,
  combineCorrespondences,
  unique,
  arrayify
};