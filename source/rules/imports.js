import {RuleApplication, correctionTypes} from "../spelling/types.js";
import {registerWordRule} from "../spelling/processor.js";
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
  determineCase
} from "../spelling/utils.js";

export {
  RuleApplication,
  correctionTypes,
  registerWordRule,
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
  determineCase
};