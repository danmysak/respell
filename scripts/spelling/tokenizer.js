const whitespace = `\\s`;
const punctuation = `[.…?!,:;–—"«»„“”/(){}[\\]]`;

class IntraTokenManager { // This class allows extra data to be injected into text without changing tokenization
  constructor() {
    this.lastTokenizer = null;
    this.lastTokenizerLength = null;
    this.intraTokens = [];
  }

  requestIntraToken() {
    const intraToken = `__E${this.intraTokens.length}__`;
    this.intraTokens.push(intraToken);
    return intraToken;
  }

  updateTokenizer() {
    this.lastTokenizer = new RegExp(`(${[whitespace, punctuation].map((pattern) => {
      const group = `(?:${[pattern, ...this.intraTokens].join('|')})*`;
      return `(?:${group}${pattern}${group})`;
    }).join('|')})`);
    this.lastTokenizerLength = this.intraTokens.length;
  }

  getTokenizer() {
    if (this.lastTokenizerLength !== this.intraTokens.length) {
      this.updateTokenizer();
    }
    return this.lastTokenizer;
  }
}

const intraTokenManager = new IntraTokenManager();

export function requestIntraToken() {
  return intraTokenManager.requestIntraToken();
}

export function tokenize(text) {
  return text.split(intraTokenManager.getTokenizer()).filter((token) => token !== '');
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