import {isWhitespace} from "./tokenizer.js";

export class TokenChain {
  constructor(tokens) {
    this.originalTokens = tokens;
    this.tokens = tokens.map((token) => this.normalizeToken(token));
    this.nonWhitespaceIndices = this.tokens.flatMap((token, index) => isWhitespace(token) ? [] : [index]);
    this.currentIndex = -1;
    this.closestLeftNonWhitespace = -1;
    this.closestRightNonWhitespace = 0;
  }

  normalizeToken(token) {
    return token.replace(/\u0301/gu, ''); // Combining acute accent
  }

  hasMore() {
    return this.currentIndex + 1 < this.tokens.length;
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

  getTokens(normalized = true) {
    return normalized ? this.tokens : this.originalTokens;
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  getCurrentToken(normalized = true) {
    return this.getTokens(normalized)[this.currentIndex];
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