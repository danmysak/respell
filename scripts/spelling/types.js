import {isWhitespace} from "./tokenizer.js";

export const correctionTypes = {
  MISTAKE: 'mistake',
  IMPROVEMENT: 'improvement',
  UNSURE: 'unsure'
};

export class RuleApplication {
  constructor(type, replacement, description) {
    this.type = type;
    this.replacement = replacement;
    this.descriptions = Array.isArray(description) ? description : [description];
  }

  get formattedDescriptions() {
    return this.descriptions.map((description) => description.replace(/(§) /g, '$1 ')); // Using a non-breaking space
  };

  static combine(a, b) {
    if (a === null || b === null) {
      return a || b;
    }
    if (b.type === correctionTypes.UNSURE) {
      return a;
    } else if (a.type === correctionTypes.UNSURE) {
      return b;
    }
    const type = [a.type, b.type].includes(correctionTypes.MISTAKE)
      ? correctionTypes.MISTAKE : correctionTypes.IMPROVEMENT;
    const replacement = b.replacement;
    const descriptions = [...a.descriptions, ...b.descriptions];
    return new RuleApplication(type, replacement, descriptions);
  }
}

export class TokenChain {
  constructor(containers, extractor = (token) => token) {
    this.containers = containers;
    this.extractor = extractor;
    this.currentIndex = -1;
    this.currentToken = null;
    this.previousToken = null;
    this.nextToken = null;
  }

  hasMore() {
    return this.currentIndex + 1 < this.containers.length;
  }

  next() {
    this.currentIndex++;
    this.currentContainer = this.computeCurrentContainer();
    this.currentToken = this.computeCurrentToken();
    this.previousToken = this.computePreviousToken();
    this.nextToken = this.computeNextToken();
  }

  computeContainerAt(index) {
    return this.containers[index];
  }

  computeCurrentContainer() {
    return this.computeContainerAt(this.currentIndex);
  }

  getCurrentContainer() {
    return this.currentContainer;
  }

  computeTokenAt(index) {
    return this.extractor(this.computeContainerAt(index));
  }

  computeCurrentToken() {
    return this.computeTokenAt(this.currentIndex);
  }

  getCurrentToken() {
    return this.currentToken;
  }

  computePreviousToken() {
    let current = this.currentIndex;
    while (true) {
      current--;
      if (current < 0) {
        return null;
      }
      const token = this.computeTokenAt(current);
      if (!isWhitespace(token)) {
        return token;
      }
    }
  }

  getPreviousToken() {
    return this.previousToken;
  }

  computeNextToken() {
    let current = this.currentIndex;
    while (true) {
      current++;
      if (current === this.containers.length) {
        return null;
      }
      const token = this.computeTokenAt(current);
      if (!isWhitespace(token)) {
        return token;
      }
    }
  }

  getNextToken() {
    return this.nextToken;
  }
}