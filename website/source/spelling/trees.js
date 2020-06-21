import {simplifyApostrophe, normalizeApostrophe, normalizeCase} from "./typography.js";
import {Correction, correctionTypes} from "./correction.js";
import {arrayify} from "./data-manipulation.js";

const leaf = Symbol('leaf');
const wildcard = Symbol('wildcard');

function constructTree(correspondences, wildcardCallback = null) {
  const tree = {};
  for (const [key, value] of Object.entries(correspondences)) {
    let level = tree;
    for (let i = key.length - 1; i >= 0; i--) {
      const char = key[i];
      if (!level.hasOwnProperty(char)) {
        level[char] = {};
      }
      level = level[char];
    }
    const storageKey = wildcardCallback && wildcardCallback(key, value) ? wildcard : leaf;
    if (!level.hasOwnProperty(storageKey)) {
      level[storageKey] = [];
    }
    level[storageKey].push(...arrayify(value));
  }
  return tree;
}

function followTree(tree, string) {
  let level = tree;
  let lastWildcard = null;
  const updateWildcard = (level, index) => {
    if (level.hasOwnProperty(wildcard)) {
      lastWildcard = {
        value: level[wildcard],
        index
      };
    }
  };
  const applyWildcard = () => {
    if (lastWildcard === null) {
      return null;
    }
    const prefix = string.slice(0, lastWildcard.index);
    return lastWildcard.value.map((string) => prefix + string);
  };
  for (let i = string.length - 1; i >= 0; i--) {
    const char = string[i];
    updateWildcard(level, i + 1);
    if (level.hasOwnProperty(char)) {
      level = level[char];
    } else {
      return applyWildcard();
    }
  }
  updateWildcard(level, 0);
  return level.hasOwnProperty(leaf) ? level[leaf] : applyWildcard();
}

export function createTreeRule(correspondences, correctionType, description,
                               {callback, postprocess, requiresExtraChange,
                                lowerCase, fixApostrophe, wildcardCallback}) {
  const tree = constructTree(correspondences, wildcardCallback || null);
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
    let values = followTree(tree, string);
    if (values === null || values.length === 0) {
      return null;
    }
    if (typeof values[0] === 'function') {
      return values[0](token, chain);
    }
    if (postprocess) {
      values = postprocess(values, token, chain, string);
      if (values === null) {
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
    const actualCorrectionType = differingValues.length === values.length ? correctionType : correctionTypes.UNCERTAIN;
    return differingValues.length === 0 ? null : new Correction(actualCorrectionType, differingValues, description, {
      requiresExtraChange: requiresExtraChange || false
    });
  };
}