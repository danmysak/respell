import {
  Correction,
  correctionTypes,
  registerPunctuationRule,
  registerWordRule,
  isArabicNumeral,
  isRomanNumeral,
  isWhitespace
} from "../imports.js";

const dashes = ["—", "–", "-", "--", "---"];

function arePotentialDates(previous, next) {
  const integerPattern = /^\d+$/;
  if (!previous.match(integerPattern) || !next.match(integerPattern)) {
    return false;
  }
  const previousNum = +previous;
  const nextNum = +next;
  return nextNum >= 1 && nextNum <= 31 && previousNum >= nextNum;
}

function process(token, chain) {
  if (!dashes.includes(token)) {
    return null;
  }
  const previousToken = chain.getPreviousToken() || '';
  const nextToken = chain.getNextToken() || '';
  if (!(
    (isArabicNumeral(previousToken) && isArabicNumeral(nextToken) && !arePotentialDates(previousToken, nextToken))
    || (isRomanNumeral(previousToken) && isRomanNumeral(nextToken))
  )) {
    return null;
  }
  const removePreviousToken = isWhitespace(chain.getPreviousToken(1, false));
  const removeNextToken = isWhitespace(chain.getNextToken(1, false));
  return !removePreviousToken && !removeNextToken ? null : new Correction(correctionTypes.MISTAKE, token,
    'Відповідно до § 161 правопису, тире для позначення числових діапазонів, записаних цифрами, не вимагає навколо '
      + 'себе пробілів, зокрема й у випадку, коли йдеться про століття, записані римськими цифрами.',
    {
      removePreviousToken,
      removeNextToken
    }
  );
}

registerPunctuationRule(process);
registerWordRule(process); // For dashes that are really hyphens