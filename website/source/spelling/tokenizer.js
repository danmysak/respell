const whitespace = `\\s`;

const punctuation = {
  dot: '.',
  sentenceDelimiters: '…?!',
  clauseDelimiters: ',:;',
  dashes: '–—',
  quotes: '"«»„“”',
  slashes: '/',
  brackets: '(){}[]'
};

const whiteSpacePattern = new RegExp(whitespace);
const sentenceBoundaryPattern = new RegExp(`^[${punctuation.dot}${punctuation.sentenceDelimiters}]+$`);

const punctuationPlain = Object.values(punctuation).join('');

const tokenizer = (() => {
  const grouped = [
    whitespace,
    `(?:[${punctuation.dot}](?![a-zA-Z0-9])|[${punctuation.sentenceDelimiters}])`,
    `[${punctuation.clauseDelimiters}${punctuation.dashes}]`
  ].map((pattern) => `(?:${pattern})+`);
  const individual = [punctuation.quotes, punctuation.slashes, punctuation.brackets].join('').split('').map(
    (char) => ['[', ']', '(', ')', '{', '}', '\\'].includes(char) ? `\\${char}` : char
  );
  return new RegExp(`(${[...grouped, ...individual].join('|')})`);
})();

export function tokenize(text) {
  return text.split(tokenizer).filter((token) => token !== '');
}

export function isWhitespace(token) {
  return token !== null && !!token.match(whiteSpacePattern);
}

function isSinglePunctuationMark(token, set) {
  return token !== null && token.length === 1 && set.includes(token);
}

export function isQuote(token) {
  return isSinglePunctuationMark(token, punctuation.quotes);
}

export function isSlash(token) {
  return isSinglePunctuationMark(token, punctuation.slashes);
}

export function isDash(token) {
  return isSinglePunctuationMark(token, punctuation.dashes);
}

export function isPunctuation(token, canBeNull = false) {
  return token === null ? canBeNull : token.length > 0 && punctuationPlain.includes(token[0]);
}

export function isWord(token) {
  return token !== null && !isWhitespace(token) && !isPunctuation(token);
}

export function canBeSentenceBoundary(token) {
  return token === null || !!token.match(sentenceBoundaryPattern);
}