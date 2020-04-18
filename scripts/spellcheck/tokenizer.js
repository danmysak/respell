import {cursorPlaceholder} from "../web/cursor.js";

const whitespace = `\\s`;
const punctuation = `[.…?!,:;–—"«»„“”/(){}[\\]]`;

const tokenizer = new RegExp(`(${[whitespace, punctuation].map(pattern => {
  const group = `(?:${pattern}|${cursorPlaceholder})*`;
  return `(?:${group}${pattern}${group})`;
}).join('|')})`);

export function tokenize(text) {
  return text.split(tokenizer).filter(token => token !== '');
}

export function isWhitespace(token) {
  return token.match(/\s/);
}

export function isPunctuation(token) {
  return token.length > 0 && punctuation.includes(token[0]);
}

export function isWord(token) {
  return !isWhitespace(token) && !isPunctuation(token);
}