import {
  Correction,
  correctionTypes,
  registerPunctuationRule,
  registerWordRule,
  canBeSentenceBoundary,
  isPunctuation,
  isWhitespace
} from "../imports.js";

const maxDefinitionLength = 6;

const dashes = ["—", "–", "-", "--", "---"];
const comma = ",";

function isDash(token) {
  return dashes.includes(token);
}

function isCommaAndDash(token) {
  return token.startsWith(comma) && isDash(token.slice(comma.length));
}

function hasPriorDashes(chain, startingLevel = 1) {
  let level = startingLevel;
  while (true) {
    const token = chain.getPreviousToken(level);
    if (canBeSentenceBoundary(token)) {
      return false;
    }
    if (isDash(token) || isCommaAndDash(token)) {
      return !canBeSentenceBoundary(chain.getPreviousToken(level + 1));
    }
    if (isPunctuation(token)) {
      return false;
    }
    if (level === maxDefinitionLength + startingLevel) {
      return false;
    }
    level++;
  }
}

function process(token, chain) {
  let replacement = null;
  let removePreviousToken = false;
  let removeNextToken = false;

  const previousToken = chain.getPreviousToken(1, false);
  const nextToken = chain.getNextToken(1, false);

  if (isDash(token) && chain.getPreviousToken() === comma && hasPriorDashes(chain, 2)) {
    replacement = '';
    if (isWhitespace(previousToken)) { // Could be false if the dash is really a hyphen
      removePreviousToken = true;      // (which is counted as a word, not punctuation)
    }
    if (isWhitespace(nextToken)) {
      removeNextToken = true; // So that the correction is presented properly to the user
      replacement += nextToken;
    }
  } else if (isCommaAndDash(token) && hasPriorDashes(chain)) {
    replacement = comma;
  }

  return replacement === null ? null : new Correction(correctionTypes.UNCERTAIN,
    replacement + (isWhitespace(nextToken) ? '' : ' '),
    'Відповідно до § 161 (п. I.6) правопису, якщо після прикладки, яку потрібно відокремити тире, стоїть кома, то '
    + 'тире слід ставити лише перед нею, а в тій позиції, де стоїть кома, тире потрібно пропускати.',
    {
      removePreviousToken,
      removeNextToken
    }
  );
}

registerPunctuationRule(process);
registerWordRule(process); // For dashes that are really hyphens