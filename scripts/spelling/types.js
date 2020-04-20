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
  }

  hasMore() {
    return this.currentIndex + 1 < this.containers.length;
  }

  next() {
    this.currentIndex++;
  }

  getContainerAt(index) {
    return this.containers[index];
  }

  getCurrentContainer() {
    return this.getContainerAt(this.currentIndex);
  }

  getTokenAt(index) {
    return this.extractor(this.getContainerAt(index));
  }

  getCurrentToken() {
    return this.getTokenAt(this.currentIndex);
  }

  getPreviousToken(canBeWhitespace = false) {
    let current = this.currentIndex;
    while (true) {
      current--;
      if (current < 0) {
        return null;
      }
      const token = this.getTokenAt(current);
      if (canBeWhitespace || !isWhitespace(token)) {
        return token;
      }
    }
  }
}