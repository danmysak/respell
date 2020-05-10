const whitespace = `\\s`;

const punctuation = {
  sentenceDelimiters: '.…?!',
  clauseDelimiters: ',:;–—',
  quotes: '"«»„“”',
  slashes: '/',
  brackets: '(){}[]'
};

const sentenceBoundaryPattern = new RegExp(`[${punctuation.sentenceDelimiters}]`);
const quotePattern = new RegExp(`[${punctuation.quotes}]`);

const punctuationPlain = Object.values(punctuation).join('');

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
    const grouped = [
      whitespace,
      `[${punctuation.sentenceDelimiters}]`,
      `[${punctuation.clauseDelimiters}]`
    ].map((pattern) => {
      const group = `(?:${[pattern, ...this.intraTokens].join('|')})*`;
      return `(?:${group}${pattern}${group})`;
    });
    const individual = [punctuation.quotes, punctuation.slashes, punctuation.brackets].join('').split('').map(
      (char) => ['[', ']', '(', ')', '{', '}', '\\'].includes(char) ? `\\${char}` : char
    );
    this.lastTokenizer = new RegExp(`(${[...grouped, ...individual].join('|')})`);
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
  return token !== null && token.match(/\s/);
}

export function isQuote(token) {
  return token !== null && token.match(quotePattern);
}

export function isPunctuation(token, canBeNull = false) {
  return token === null ? canBeNull : token.length > 0 && punctuationPlain.includes(token[0]);
}

export function isWord(token) {
  return token !== null && !isWhitespace(token) && !isPunctuation(token);
}

export function canBeSentenceBoundary(token) {
  return token === null || token.match(sentenceBoundaryPattern);
}