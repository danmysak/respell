export const cursorPlaceholder = '[[CURSOR]]';

export function setCursor(startNode, startOffset, endNode = startNode, endOffset = startOffset) {
  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

export function getRangeIfInside(node, shouldBeCollapsed = false) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  const range = selection.getRangeAt(0);
  if (!range || (shouldBeCollapsed && !range.collapsed)) {
    return null;
  }
  return node.contains(range.commonAncestorContainer) ? range : null;
}

export function getRangeIfCollapsedAndInside(node) {
  return getRangeIfInside(node, true);
}

export function insertAtCursor(parentNode, contents, collapseToStart = false) {
  const range = getRangeIfInside(parentNode);
  if (range === null) {
    return false;
  }
  range.deleteContents();
  range.insertNode(contents);
  range.collapse(collapseToStart);
}

function getParentOffset(parent, node, offset) {
  let currentNode, currentOffset;
  if (node.nodeType === Node.TEXT_NODE) {
    currentNode = node;
    currentOffset = offset;
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    if (offset === 0) {
      currentNode = node;
      currentOffset = 0;
    } else {
      currentNode = node.childNodes[offset - 1];
      currentOffset = currentNode.textContent.length;
    }
  } else { // Shouldn't happen
    return 0;
  }
  while (currentNode !== parent) {
    let currentSibling = currentNode.parentNode.firstChild;
    while (currentSibling !== currentNode) {
      currentOffset += currentSibling.textContent.length;
      currentSibling = currentSibling.nextSibling;
    }
    currentNode = currentNode.parentNode;
  }
  return currentOffset;
}

export function getSelectionOffsets(container) {
  const range = getRangeIfInside(container);
  if (range === null) {
    return null;
  }
  const start = getParentOffset(container, range.startContainer, range.startOffset);
  const end = range.endContainer === range.startContainer && range.endOffset === range.startOffset
    ? start
    : getParentOffset(container, range.endContainer, range.endOffset);
  return {
    start,
    end
  };
}

function getNodeAtOffset(parent, offset) {
  let currentNode = parent;
  let currentOffset = offset;
  while (true) {
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      let currentChild = currentNode.firstChild;
      while (true) {
        if (currentChild === null) {
          return {
            node: currentNode,
            offset: currentNode.childNodes.length
          };
        }
        const length = currentChild.textContent.length;
        if (currentOffset <= length) {
          currentNode = currentChild;
          break;
        }
        currentOffset -= length;
        currentChild = currentChild.nextSibling;
      }
    } else if (currentNode.nodeType === Node.TEXT_NODE) {
      return {
        node: currentNode,
        offset: Math.min(currentOffset, currentNode.textContent.length)
      };
    } else { // Shouldn't happen
      return {
        node: currentNode,
        offset: 0
      }
    }
  }
}

export function setSelectionOffsets(container, offsets) {
  if (offsets === null) {
    return;
  }
  const start = getNodeAtOffset(container, offsets.start);
  const end = offsets.end === offsets.start ? start : getNodeAtOffset(container, offsets.end);
  setCursor(start.node, start.offset, end.node, end.offset);
}

export function serializeCursor(container) {
  const range = getRangeIfCollapsedAndInside(container);
  if (range) {
    const cursor = document.createTextNode(cursorPlaceholder);
    range.insertNode(cursor);
  }
}

export function restoreCursor(container) {
  if (container.nodeType === Node.TEXT_NODE) {
    const index = container.textContent.indexOf(cursorPlaceholder);
    if (index === -1) {
      return false;
    } else {
      container.textContent = container.textContent.replace(cursorPlaceholder, '');
      setCursor(container, index);
      return true;
    }
  } else {
    for (let i = 0; i < container.childNodes.length; i++) {
      if (restoreCursor(container.childNodes[i])) {
        return true;
      }
    }
    return false;
  }
}