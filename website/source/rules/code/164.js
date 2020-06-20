import {
  Correction,
  correctionTypes,
  registerPunctuationRule,
  canBeSentenceBoundary,
  isWord,
  isWhitespace,
  isQuote,
  isCapitalized,
  getFirstLetter
} from "../imports.js";

const period = ".";

function examineNext(chain) {
  let level = 1;
  while (true) {
    const token = chain.getNextToken(level);
    if (token === null) {
      return true;
    }
    if (isWord(token)) {
      return isCapitalized(getFirstLetter(token));
    }
    level++;
  }
}

registerPunctuationRule((token, chain) => {
  if (!isQuote(token)) {
    return null;
  }
  const previousToken = chain.getPreviousToken(1, false);
  const nextToken = chain.getNextToken(1, false);
  if ((previousToken !== null && canBeSentenceBoundary(previousToken) && previousToken !== period)
    && (nextToken === null || (isWhitespace(nextToken) && examineNext(chain)))) {
    return new Correction(correctionTypes.MISTAKE, token + period,
      'Відповідно до § 164 правопису, якщо фрагмент у лапках закінчує речення, після лапок потрібно поставити крапку '
        + 'навіть у тому випадку, якщо в кінці фрагмента стоїть знак питання, знак оклику чи три крапки, і навіть якщо '
        + 'цитата є самостійною та стоїть після двокрапки.'
    );
  } else {
    return null;
  }
});