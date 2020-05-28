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

const tokenizer = (() => {
  const grouped = [
    whitespace,
    `[${punctuation.sentenceDelimiters}]`,
    `[${punctuation.clauseDelimiters}]`
  ].map((pattern) => {
    const group = `(?:${pattern})*`;
    return `(?:${group}${pattern}${group})`;
  });
  const individual = [punctuation.quotes, punctuation.slashes, punctuation.brackets].join('').split('').map(
    (char) => ['[', ']', '(', ')', '{', '}', '\\'].includes(char) ? `\\${char}` : char
  );
  return new RegExp(`(${[...grouped, ...individual].join('|')})`);
})();

export function tokenize(text) {
  return text.split(tokenizer).filter((token) => token !== '');
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