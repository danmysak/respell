import {simplifyApostrophe, normalizeApostrophe, normalizeCase} from "./typography.js";
import {Correction, correctionTypes} from "./correction.js";
import {arrayify} from "./data-manipulation.js";

export const treeWildcardCharacter = '*';
const leaf = Symbol('leaf');
const wildcard = Symbol('wildcard');

function constructTree(correspondences) {
  const tree = {};
  for (const [key, value] of Object.entries(correspondences)) {
    let level = tree;
    const [isWildcard, minIndex] = key.length > 0 && key[0] === treeWildcardCharacter ? [true, 1] : [false, 0];
    for (let i = key.length - 1; i >= minIndex; i--) {
      const char = key[i];
      if (!level.hasOwnProperty(char)) {
        level[char] = {};
      }
      level = level[char];
    }
    const storageKey = isWildcard ? wildcard : leaf;
    if (!level.hasOwnProperty(storageKey)) {
      level[storageKey] = [];
    }
    level[storageKey].push(...arrayify(value));
  }
  return tree;
}

function followTree(tree, string, recursive) {
  const separator = '-';
  let level = tree;
  let lastWildcard = null;
  let lastRecursive = null;
  const updateWildcard = (level, index) => {
    if (level.hasOwnProperty(wildcard)) {
      lastWildcard = {
        value: level[wildcard],
        index
      };
    }
  };
  const updateRecursive = (level, index) => {
    if (recursive && (level.hasOwnProperty(leaf) || level.hasOwnProperty(wildcard)) && string[index] === separator) {
      lastRecursive = {
        value: level[leaf] || level[wildcard],
        index
      }
    }
  };
  const combineParts = (prefixes, infix, suffixes) => {
    return suffixes.flatMap((suffix) => prefixes.map((prefix) => prefix + infix + suffix));
  };
  const goRecursive = (prefix) => {
    const list = followTree(tree, prefix, true);
    return list === null || list.length === 0 ? [prefix] : list;
  };
  const applyRecursive = () => {
    return combineParts(goRecursive(string.slice(0, lastRecursive.index)), separator, lastRecursive.value);
  };
  const applyWildcard = () => {
    const prefix = string.slice(0, lastWildcard.index + 1);
    let prefixes, infix;
    if (recursive && prefix.includes(separator)) {
      const separatorPosition = prefix.lastIndexOf(separator);
      prefixes = goRecursive(prefix.slice(0, separatorPosition));
      infix = prefix.slice(separatorPosition);
    } else {
      prefixes = [prefix];
      infix = '';
    }
    return combineParts(prefixes, infix, lastWildcard.value);
  };
  const end = () => {
    if (lastRecursive) {
      return applyRecursive();
    } else if (lastWildcard) {
      return applyWildcard();
    } else {
      return null;
    }
  };
  for (let i = string.length - 1; i >= 0; i--) {
    updateRecursive(level, i);
    updateWildcard(level, i);
    const char = string[i];
    if (level.hasOwnProperty(char)) {
      level = level[char];
    } else {
      return end();
    }
  }
  updateWildcard(level, -1);
  if (level.hasOwnProperty(leaf)) {
    return level[leaf];
  } else {
    return end();
  }
}

export function createTreeRule(correspondences, correctionType, description,
                               {callback, postprocess, requiresExtraChange,
                                lowerCase, fixApostrophe, recursive}) {
  const tree = constructTree(correspondences);
  return (token, chain) => {
    if (callback && !callback(token, chain)) {
      return null;
    }
    let string = token;
    if (lowerCase) {
      string = string.toLowerCase();
    }
    if (fixApostrophe) {
      string = simplifyApostrophe(string);
    }
    let values = followTree(tree, string, recursive || false);
    if (values === null || values.length === 0) {
      return null;
    }
    if (typeof values[0] === 'function') {
      return values[0](token, chain);
    }
    if (postprocess) {
      values = postprocess(values, token, chain, string);
      if (values === null || values.length === 0) {
        return null;
      }
    }
    if (fixApostrophe) {
      values = values.map((value) => normalizeApostrophe(value, token));
    }
    if (lowerCase) {
      values = values.map((value) => normalizeCase(value, token));
    }
    const differingValues = values.filter((value) => simplifyApostrophe(value) !== simplifyApostrophe(token));
    const computedCorrectionType = typeof correctionType === 'function' ? correctionType(token) : correctionType;
    const actualCorrectionType = differingValues.length === values.length ? computedCorrectionType
                                                                          : correctionTypes.UNCERTAIN;
    return differingValues.length === 0 ? null : new Correction(actualCorrectionType, differingValues, description, {
      requiresExtraChange: requiresExtraChange || false
    });
  };
}