import {
  RuleApplication,
  correctionTypes,
  registerWordRule,
  isCapitalized,
  canBeSentenceBoundary,
  isPunctuation
} from "../imports.js";

registerWordRule((token, chain) => {
  const applicable =
    chain.getPreviousToken() === '('
    && !canBeSentenceBoundary(chain.getPreviousToken(2))
    && !(isPunctuation(chain.getPreviousToken(2)) && canBeSentenceBoundary(chain.getPreviousToken(3)))
    && isCapitalized(token);

  return !applicable ? null : new RuleApplication(correctionTypes.UNSURE, token.toLowerCase(),
    'Відповідно до § 46 правопису, ремарки та посилання, взяті в дужки, з великої літери слід писати лише в тому разі, '
      + 'якщо дужки стоять за розділовим знаком, що позначає кінець речення.'
  );
});