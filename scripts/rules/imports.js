import {correctionTypes} from "../spelling/types.js";
import {registerWordRule} from "../spelling/processor.js";
import {
  createWordRule,
  parenthesizeFirst,
  canBeSentenceBoundary,
  getConsonants,
  getVowels,
  getSibilants
} from "../spelling/utils.js";

export {
  correctionTypes,
  registerWordRule,
  createWordRule,
  parenthesizeFirst,
  canBeSentenceBoundary,
  getConsonants,
  getVowels,
  getSibilants
};