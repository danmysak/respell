export const correctionTypes = {
  MISTAKE: 'mistake',
  IMPROVEMENT: 'improvement',
  UNCERTAIN: 'uncertain'
};

export class Correction {
  constructor(type, replacement, description, {
    alternatives = [],
    requiresExtraChange = false,
    removePreviousToken = false,
    removeNextToken = false
  } = {}) {
    this.type = type;
    if (replacement === null && alternatives.length > 0) {
      this.replacement = alternatives[0];
      this.alternatives = alternatives.slice(1);
    } else {
      this.replacement = replacement;
      this.alternatives = alternatives;
    }
    this.description = description;
    this.requiresExtraChange = requiresExtraChange;
    this.removePreviousToken = removePreviousToken;
    this.removeNextToken = removeNextToken;
  }
}