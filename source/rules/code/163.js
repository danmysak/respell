import {
  Correction,
  correctionTypes,
  registerPunctuationRule,
  canBeSentenceBoundary,
  isWord,
  isPunctuation,
  isCapitalized,
  getFirstLetter
} from "../imports.js";

const [leftBracket, rightBracket] = ["(", ")"];
const period = ".";

function isInitialLetter(token) {
  return isWord(token) && token.length === 1 && isCapitalized(token);
}

function examine(chain, startingLevel) {
  let level = startingLevel;
  let lastCapitalized = false;
  let sawLowerCased = false;
  while (true) {
    const token = chain.getPreviousToken(level);
    if (canBeSentenceBoundary(token) && !isInitialLetter(chain.getPreviousToken(level + 1))) {
      return true; // There are multiple sentences inside the parentheses
    }
    if (isWord(token)) {
      if (token.toLowerCase() === token) {
        sawLowerCased = true;
      }
      lastCapitalized = isCapitalized(getFirstLetter(token));
    } else if (token === leftBracket) {
      const preceding = chain.getPreviousToken(level + 1);
      return lastCapitalized && sawLowerCased && (
        canBeSentenceBoundary(preceding)
        || (isPunctuation(preceding) && canBeSentenceBoundary(chain.getPreviousToken(level + 2)))
      );
    }
    level++;
  }
}

registerPunctuationRule((token, chain) => {
  if (token === period && chain.getPreviousToken(1, false) === rightBracket
    && !canBeSentenceBoundary(chain.getPreviousToken(2)) && examine(chain, 2)) {
    return new Correction(correctionTypes.UNCERTAIN, period + rightBracket,
      'Відповідно до § 163 правопису, якщо в дужках подано одне або кілька повноцінних речень, крапка, що завершує '
        + 'останнє речення, має міститися всередині дужок, а не поза ними.',
      {
        removePreviousToken: true
      }
    );
  } else {
    return null;
  }
});