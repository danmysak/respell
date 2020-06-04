export class History {
  constructor(tag) {
    this.tag = tag;
    this.initialized = false;
  }

  setItems(items) {
    this.items = items;
    this.elementIndex.clear();
    this.items.forEach(({element}, index) => {
      this.elementIndex.set(element, index);
    });
  }

  computeDiff(source, target) {
    const minLength = Math.min(source.length, target.length);
    let left = 0;
    while (left < minLength && source[left] === target[left]) {
      left++;
    }
    let right = 0;
    while (left + right < minLength && source[source.length - 1 - right] === target[target.length - 1 - right]) {
      right++;
    }
    return {
      prefixLength: left,
      suffixLength: right,
      middle: left + right === 0
        ? [source, target]
        : [source.slice(left, source.length - right), target.slice(left, target.length - right)]
    };
  }

  applyChange(changes, sourceId, targetId, selection) {
    changes.sort((a, b) => a.indices[targetId] - b.indices[targetId]);
    const items = [];
    for (const {indices, diff: {prefixLength, suffixLength, middle}} of changes) {
      if (indices[targetId] === null) {
        continue;
      }
      const sourceIndex = indices[sourceId];
      let element;
      let text = null;
      if (sourceIndex === null) {
        element = document.createElement(this.tag);
        element.textContent = middle[targetId];
      } else {
        element = this.items[sourceIndex].element;
        const oldText = this.items[sourceIndex].text;
        if (prefixLength + suffixLength === 0) {
          text = oldText;
        } else {
          element.textContent =
            oldText.slice(0, prefixLength) + middle[targetId] + oldText.slice(oldText.length - suffixLength);
        }
      }
      items.push({
        element,
        text: text !== null ? text : element.textContent
      });
    }
    this.setItems(items);
    return {
      elements: items.map(({element}) => element),
      selection
    };
  }

  initialize(data, selection) {
    this.changeSets = [];
    this.selections = [selection];
    this.state = 0;
    this.elementIndex = new Map();
    this.setItems(data.map(({element}) => ({
      element,
      text: element.textContent
    })));
    this.initialized = true;
  }

  update(data, selection) {
    if (!this.initialized) {
      this.initialize(data, selection);
      return;
    }

    const items = [];
    const changes = [];
    const addChange = (sourceIndex, targetIndex, targetText) => {
      changes.push({
        indices: [sourceIndex, targetIndex],
        diff: this.computeDiff(
          sourceIndex === null ? '' : this.items[sourceIndex].text,
          targetIndex === null ? '' : targetText
        )
      });
    };
    data.forEach(({element, mutated}, index) => {
      const lastIndex = this.elementIndex.get(element);
      const text = mutated || lastIndex === undefined ? element.textContent : this.items[lastIndex].text;
      if (lastIndex === undefined) {
        addChange(null, index, text);
      } else {
        this.elementIndex.delete(element);
        addChange(lastIndex, index, text);
      }
      items.push({
        element,
        text
      });
    });
    for (const [element, lastIndex] of this.elementIndex.entries()) {
      addChange(lastIndex, null, null);
    }
    if (this.state < this.changeSets.length) {
      this.changeSets.splice(this.state);
      this.selections.splice(this.state + 1);
    }
    this.state++;
    this.changeSets.push(changes);
    this.selections.push(selection);
    this.setItems(items);
  }

  updateSelection(selection) {
    if (!this.initialized) {
      return;
    }
    this.selections[this.state] = selection;
  }

  getSelection() {
    return this.initialized ? this.selections[this.state] : null;
  }

  undo() {
    if (!this.initialized) {
      return null;
    }
    if (this.state === 0) {
      return null;
    }
    this.state--;
    return this.applyChange(this.changeSets[this.state], 1, 0, this.selections[this.state]);
  }

  canUndo() {
    return this.initialized && this.state > 0;
  }

  redo() {
    if (!this.initialized) {
      return null;
    }
    if (this.state === this.changeSets.length) {
      return false;
    }
    this.state++;
    return this.applyChange(this.changeSets[this.state - 1], 0, 1, this.selections[this.state]);
  }

  canRedo() {
    return this.initialized && this.state < this.changeSets.length;
  }
}