import {arrayify} from "./data-manipulation.js";
import {isWhitespace} from "./tokenizer.js";

export const correctionTypes = {
  MISTAKE: 'mistake',
  IMPROVEMENT: 'improvement',
  UNCERTAIN: 'uncertain'
};

export class Correction {
  constructor(type, replacements, description, {
    requiresExtraChange = false,
    removePreviousToken = false,
    removeNextToken = false
  } = {}) {
    this.type = type;
    this.replacements = arrayify(replacements);
    this.description = description;
    this.requiresExtraChange = requiresExtraChange;
    this.removePreviousToken = removePreviousToken;
    this.removeNextToken = removeNextToken;
  }
}

export function createCorrectionPresentation(correction, tokens, normalizedTokens, tokenIndex) {
  const indexInRange = (index) => index >= 0 && index < tokens.length;

  let changeFrom = [tokens[tokenIndex]];
  let changeTo = correction.replacements.map((replacement) => [replacement]);
  for (const [shouldRemove, shift, pusher] of [
    [correction.removePreviousToken, -1, 'unshift'],
    [correction.removeNextToken, 1, 'push']
  ]) {
    const shifted = tokenIndex + shift;
    if (shouldRemove && indexInRange(shifted)) {
      if (isWhitespace(normalizedTokens[shifted])) {
        const doublyShifted = shifted + shift;
        if (indexInRange(doublyShifted)) {
          changeFrom[pusher](' ');
          changeFrom[pusher](tokens[doublyShifted]);
          changeTo.forEach((replacement) => {
            replacement[pusher](tokens[doublyShifted]);
          });
        }
      } else {
        changeFrom[pusher](tokens[shifted]);
      }
    }
  }

  return {
    type: correction.type,
    description: correction.description,
    requiresExtraChange: correction.requiresExtraChange,
    changeFrom: changeFrom.join(''),
    changeTo: changeTo.map((replacement) => replacement.join(''))
  };
}