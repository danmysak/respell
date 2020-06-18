import {
  Correction,
  correctionTypes,
  registerPunctuationRule,
  isWhitespace,
  isWord,
  isSlash,
  isArabicNumeral
} from "../imports.js";

const maxShortWordLength = 3;

function isShortWord(token) {
  return isWord(token) && token.length <= maxShortWordLength;
}

registerPunctuationRule((token, chain) => {
  if (!isSlash(token)) {
    return null;
  }
  const previousSpace = isWhitespace(chain.getPreviousToken(1, false));
  const nextSpace = isWhitespace(chain.getNextToken(1, false));
  if (previousSpace && nextSpace) {
    return null;
  }
  const previousToken = chain.getPreviousToken();
  const nextToken = chain.getNextToken();
  if (previousToken === null || nextToken === null
    || (isArabicNumeral(previousToken) && isArabicNumeral(nextToken))
    || (isShortWord(previousToken) && isShortWord(nextToken))) {
    return null;
  }
  return new Correction(correctionTypes.MISTAKE, (previousSpace ? '' : ' ') + token + (nextSpace ? '' : ' '),
    'Відповідно до § 165 правопису, крім випадку розділення коротких слів або скорочень чи позначення років, навколо '
      + 'скісної риски потрібно ставити пробіли.'
  );
});