import {correctionTypes} from "../spelling/types.js";
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
  combineCorrespondences
} from "../spelling/utils.js";

export {
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
  combineCorrespondences
};