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

  computeCommonLengths(source, target, equal = (a, b) => a === b) {
    const minLength = Math.min(source.length, target.length);
    let left = 0;
    while (left < minLength && equal(source[left], target[left])) {
      left++;
    }
    let right = 0;
    while (left + right < minLength && equal(source[source.length - 1 - right], target[target.length - 1 - right])) {
      right++;
    }
    return [left, right];
  }

  computeDiff(source, target, guaranteedEqual = false) {
    if (guaranteedEqual) {
      return {
        prefixLength: source.length,
        suffixLength: 0,
        middle: ['', '']
      };
    }
    const [prefixLength, suffixLength] = this.computeCommonLengths(source, target);
    return {
      prefixLength,
      suffixLength,
      middle: prefixLength + suffixLength === 0
        ? [
          source,
          target
        ] : [
          source.slice(prefixLength, source.length - suffixLength),
          target.slice(prefixLength, target.length - suffixLength)
        ]
    };
  }

  applyChange(changes, sourceId, targetId, selection) {
    changes.middle.sort((a, b) => a.indices[targetId] - b.indices[targetId]);
    const items = [];
    for (let index = 0; index < changes.prefixLength; index++) {
      items.push(this.items[index]);
    }
    for (const {indices, diff: {prefixLength, suffixLength, middle}} of changes.middle) {
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
        if (prefixLength + suffixLength === oldText.length && middle[targetId].length === 0) {
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
    for (let index = this.items.length - changes.suffixLength; index < this.items.length; index++) {
      items.push(this.items[index]);
    }
    this.setItems(items);
    this.currentSelection = selection;
    return {
      elements: items.map(({element}) => element),
      selection
    };
  }

  initialize(data, selection) {
    this.changeSets = [];
    this.selections = [];
    this.currentSelection = selection;
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
    const [prefixLength, suffixLength] = this.computeCommonLengths(
      this.items, data,
      ({element: itemElement}, {element: dataElement, mutated}) => !mutated && itemElement === dataElement
    );
    const changes = {
      prefixLength,
      suffixLength,
      middle: []
    };
    const addChange = (sourceIndex, targetIndex, targetText, guaranteedEqualText = false) => {
      changes.middle.push({
        indices: [sourceIndex, targetIndex],
        diff: this.computeDiff(
          sourceIndex === null ? '' : this.items[sourceIndex].text,
          targetIndex === null ? '' : targetText,
          guaranteedEqualText
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
        if (index >= prefixLength && index < data.length - suffixLength) {
          addChange(lastIndex, index, text, !mutated);
        }
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
      this.selections.splice(this.state);
    }
    this.state++;
    this.changeSets.push(changes);
    this.selections.push([this.currentSelection, selection]);
    this.currentSelection = selection;
    this.setItems(items);
  }

  updateSelection(selection) {
    if (!this.initialized) {
      return;
    }
    this.currentSelection = selection;
  }

  getSelection() {
    return this.initialized ? this.currentSelection : null;
  }

  undo() {
    if (!this.initialized) {
      return null;
    }
    if (this.state === 0) {
      return null;
    }
    this.state--;
    return this.applyChange(this.changeSets[this.state], 1, 0, this.selections[this.state][0]);
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
    return this.applyChange(this.changeSets[this.state - 1], 0, 1, this.selections[this.state - 1][1]);
  }

  canRedo() {
    return this.initialized && this.state < this.changeSets.length;
  }
}