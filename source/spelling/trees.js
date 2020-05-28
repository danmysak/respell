import {simplifyApostrophe, normalizeApostrophe, normalizeCase} from "./typography.js";
import {Correction} from "./correction.js";

const leaf = Symbol('leaf');

function constructTree(correspondences) {
  const tree = {};
  for (const key of Object.keys(correspondences)) {
    let level = tree;
    for (const char of key) {
      if (!level.hasOwnProperty(char)) {
        level[char] = {};
      }
      level = level[char];
    }
    if (!level.hasOwnProperty(leaf)) {
      level[leaf] = [];
    }
    const value = correspondences[key];
    level[leaf].push(...(Array.isArray(value) ? value : [value]));
  }
  return tree;
}

function followTree(tree, string) {
  let level = tree;
  for (const char of string) {
    if (level.hasOwnProperty(char)) {
      level = level[char];
    } else {
      return null;
    }
  }
  return level.hasOwnProperty(leaf) ? level[leaf] : null;
}

export function createTreeRule(correspondences, correctionType, description,
                               {callback, postprocess, requiresExtraChange, lowerCase, fixApostrophe}) {
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
    let values = followTree(tree, string);
    if (values === null || values.length === 0) {
      return null;
    }
    if (typeof values[0] === 'function') {
      return values[0](token, chain);
    }
    if (postprocess) {
      values = postprocess(values, token, chain);
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
    values = values.filter((value) => simplifyApostrophe(value) !== simplifyApostrophe(token));
    return values.length === 0 ? null : new Correction(correctionType, values, description, {
      requiresExtraChange: requiresExtraChange || false
    });
  };
}