import {letterCases} from "../includes/typography.js";
import {applyOrMap} from "./data-manipulation.js";

export function parenthesizeFirst(items) {
  return applyOrMap(items, (item) => `(${item[0]})${item.slice(1)}`);
}

export function getLastLetter(string) {
  return string === '' ? '' : string[string.length - 1];
}

export function simplifyApostrophe(string) {
  return string.replace(/’/g, "'");
}

export function normalizeApostrophe(string, model) {
  return model.includes("'") ? simplifyApostrophe(string) : string.replace(/'/g, '’');
}

export function capitalize(string) {
  return string.length === '' ? string : string[0].toUpperCase() + string.slice(1).toLowerCase();
}

export function determineLetterCase(string) {
  if (string === '') {
    return letterCases.EMPTY;
  }
  if (string === string.toLowerCase()) {
    return letterCases.LOWER;
  }
  if (string === capitalize(string)) {
    return letterCases.CAPITALIZED;
  }
  if (string === string.toUpperCase()) {
    return letterCases.UPPER;
  }
  const parts = string.split('-');
  if (parts.length > 1 && parts.every((part) => part !== '' && part === capitalize(part))) {
    return letterCases.CAMEL;
  }
  return letterCases.OTHER;
}

export function isCapitalized(string) {
  return determineLetterCase(string) === letterCases.CAPITALIZED;
}

export function normalizeCase(string, model) {
  switch (determineLetterCase(model)) {
    case letterCases.CAPITALIZED:
      return capitalize(string);
    case letterCases.UPPER:
      return string.toUpperCase();
    case letterCases.CAMEL:
      return string.split('-').map((part) => capitalize(part)).join('-');
    default:
      return string;
  }
}