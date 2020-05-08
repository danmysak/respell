import {isWhitespace} from "./tokenizer.js";

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
    this.replacement = replacement;
    this.description = description;
    this.alternatives = alternatives;
    this.requiresExtraChange = requiresExtraChange;
    this.removePreviousToken = removePreviousToken;
    this.removeNextToken = removeNextToken;
  }
}

export class TokenChain {
  constructor(containers, extractor = (token) => token) {
    this.containers = containers;
    this.tokens = containers.map(extractor);
    this.nonWhitespaceIndices = this.tokens.flatMap((token, index) => isWhitespace(token) ? [] : [index]);
    this.currentIndex = -1;
    this.closestLeftNonWhitespace = -1;
    this.closestRightNonWhitespace = 0;
  }

  hasMore() {
    return this.currentIndex + 1 < this.containers.length;
  }

  next() {
    if (this.closestRightNonWhitespace < this.nonWhitespaceIndices.length
      && this.currentIndex === this.nonWhitespaceIndices[this.closestRightNonWhitespace]) {
      this.closestRightNonWhitespace++;
    }
    this.currentIndex++;
    if (this.closestLeftNonWhitespace + 1 < this.nonWhitespaceIndices.length
      && this.currentIndex === this.nonWhitespaceIndices[this.closestLeftNonWhitespace + 1]) {
      this.closestLeftNonWhitespace++;
    }
  }

  getCurrentContainer() {
    return this.containers[this.currentIndex];
  }

  getCurrentToken() {
    return this.tokens[this.currentIndex];
  }

  extractFromList(list, index) {
    return index === null || index < 0 || index >= list.length ? null : list[index];
  }

  getAnyAdjacentToken(level) {
    return this.extractFromList(this.tokens, this.currentIndex + level);
  }

  getNonWhitespaceAdjacentToken(level) {
    const currentIsWhitespace = this.closestLeftNonWhitespace !== this.closestRightNonWhitespace;
    if (level === 0) {
      return currentIsWhitespace ? null : this.getCurrentToken();
    }
    const shift = currentIsWhitespace ? 1 : 0;
    return this.extractFromList(this.tokens, this.extractFromList(this.nonWhitespaceIndices,
      (level > 0 ? this.closestRightNonWhitespace - shift : this.closestLeftNonWhitespace + shift) + level));
  }

  getAdjacentToken(level, nonWhitespace) {
    return nonWhitespace ? this.getNonWhitespaceAdjacentToken(level) : this.getAnyAdjacentToken(level);
  }

  getPreviousToken(level = 1, nonWhitespace = true) {
    return this.getAdjacentToken(-level, nonWhitespace);
  }

  getNextToken(level = 1, nonWhitespace = true) {
    return this.getAdjacentToken(level, nonWhitespace);
  }
}