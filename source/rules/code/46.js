import {
  Correction,
  correctionTypes,
  registerWordRule,
  isCapitalized,
  canBeSentenceBoundary,
  isPunctuation,
  isWord,
  isRomanNumeral,
  determineCase,
  cases
} from "../imports.js";

const maxLookupLevel = 3;

function getNextWord(chain, maxLookupLevel) {
  for (let level = 1; level <= maxLookupLevel; level++) {
    const token = chain.getNextToken(level);
    if (token === ')') {
      return null;
    }
    if (isWord(token)) {
      return token;
    }
  }
  return null;
}

registerWordRule((token, chain) => {
  const applicable =
    chain.getPreviousToken() === '('
    && !isRomanNumeral(token)
    && !canBeSentenceBoundary(chain.getPreviousToken(2))
    && !(isPunctuation(chain.getPreviousToken(2)) && canBeSentenceBoundary(chain.getPreviousToken(3)))
    && isCapitalized(token) && determineCase(getNextWord(chain, maxLookupLevel) || '') === cases.LOWER;

  return !applicable ? null : new Correction(correctionTypes.UNCERTAIN, token.toLowerCase(),
    'Відповідно до § 46 правопису, ремарки та посилання, взяті в дужки, з великої літери слід писати лише в тому разі, '
      + 'якщо дужки стоять за розділовим знаком, що позначає кінець речення.'
  );
});