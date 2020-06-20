import {
  Correction,
  correctionTypes,
  registerWordRule,
  isCapitalized,
  canBeSentenceBoundary,
  isPunctuation,
  isWord,
  isRomanNumeral,
  determineLetterCase,
  letterCases
} from "../imports.js";

const [leftBracket, rightBracket] = ["(", ")"];
const maxLookupLevel = 3;

function getNextWord(chain, maxLookupLevel) {
  for (let level = 1; level <= maxLookupLevel; level++) {
    const token = chain.getNextToken(level);
    if (token === rightBracket) {
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
    chain.getPreviousToken() === leftBracket
    && !isRomanNumeral(token)
    && !canBeSentenceBoundary(chain.getPreviousToken(2))
    && !(isPunctuation(chain.getPreviousToken(2)) && canBeSentenceBoundary(chain.getPreviousToken(3)))
    && isCapitalized(token) && determineLetterCase(getNextWord(chain, maxLookupLevel) || '') === letterCases.LOWER;

  return !applicable ? null : new Correction(correctionTypes.UNCERTAIN, token.toLowerCase(),
    'Відповідно до § 46 правопису, ремарки та посилання, взяті в дужки, з великої літери слід писати лише в тому разі, '
      + 'якщо дужки стоять за розділовим знаком, що позначає кінець речення.'
  );
});