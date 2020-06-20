import {Correction, correctionTypes, registerPunctuationRule, isWord, isSlash, isArabicNumeral} from "../imports.js";

const maxShortWordLength = 3;

function isShortWord(token) {
  return isWord(token) && token.length <= maxShortWordLength;
}

registerPunctuationRule((token, chain) => {
  if (!isSlash(token) || isSlash(chain.getPreviousToken()) || isSlash(chain.getNextToken())
    || !isWord(chain.getPreviousToken(1, false)) || !isWord(chain.getNextToken(1, false))) {
    return null;
  }
  const previousToken = chain.getPreviousToken();
  const nextToken = chain.getNextToken();
  if (previousToken === null || nextToken === null
    || (isArabicNumeral(previousToken) && isArabicNumeral(nextToken))
    || (isShortWord(previousToken) && isShortWord(nextToken))) {
    return null;
  }
  return new Correction(correctionTypes.MISTAKE, ' ' + token + ' ',
    'Відповідно до § 165 правопису, крім випадку розділення коротких слів або скорочень чи позначення років, навколо '
      + 'скісної риски потрібно ставити пробіли.'
  );
});