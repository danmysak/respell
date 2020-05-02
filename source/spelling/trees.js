import {simplifyApostrophe, normalizeApostrophe, normalizeCase} from "./utils.js";
import {RuleApplication} from "./types.js";

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
                               {callback, mapper, requiresExtraChange, lowerCase, fixApostrophe}) {
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
    if (mapper) {
      values = values.map((value) => mapper(token, chain, value));
    }
    if (fixApostrophe) {
      values = values.map((value) => normalizeApostrophe(value));
    }
    if (lowerCase) {
      values = values.map((value) => normalizeCase(value, token));
    }
    if (values[0] === (fixApostrophe ? normalizeApostrophe(token) : token)) {
      // The values should have been previously ordered so that values[0] is the most probable one
      return null;
    }
    return new RuleApplication(correctionType, values[0], description, {
      alternatives: values.slice(1),
      requiresExtraChange: requiresExtraChange || false
    });
  };
}