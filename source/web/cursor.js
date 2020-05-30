import {getParentOffset, getNodeAtOffset} from "./offsets.js";

export const cursorPlaceholder = '[[CURSOR]]';

function setCursorRange(range) {
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

export function setCursor(startNode, startOffset, endNode = startNode, endOffset = startOffset) {
  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  setCursorRange(range);
  return range;
}

export function getRangeIfInside(node) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  const range = selection.getRangeAt(0);
  if (!range) {
    return null;
  }
  return node.contains(range.commonAncestorContainer) ? range : null;
}

function collapseRangeIfInside(container, toStart = false) {
  const range = getRangeIfInside(container);
  if (range === null) {
    return null;
  } else if (range.collapsed) {
    return range;
  } else if (toStart) {
    return setCursor(range.startContainer, range.startOffset);
  } else {
    return setCursor(range.endContainer, range.endOffset);
  }
}

export function insertAtCursor(parentNode, contents, collapseToStart = false) {
  const range = getRangeIfInside(parentNode);
  if (range === null) {
    return false;
  }
  range.deleteContents();
  let container, firstNode, lastNode;
  if (Array.isArray(contents)) {
    if (contents.length === 0) {
      return false;
    }
    firstNode = contents[0];
    lastNode = contents[contents.length - 1];
    container = new DocumentFragment();
    container.append(...contents);
  } else {
    firstNode = contents;
    lastNode = contents;
    container = contents;
  }
  range.insertNode(container);
  // collapseRangeIfInside wouldn't work because Safari leaves cursor at the beginning of the inserted contents
  const newRange = document.createRange();
  if (collapseToStart) {
    newRange.setStartBefore(firstNode);
    newRange.setEndBefore(firstNode);
  } else {
    newRange.setStartAfter(lastNode);
    newRange.setEndAfter(lastNode);
  }
  setCursorRange(newRange);
  return true;
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
    end,
    extraInfo: {
      startContainer: range.startContainer,
      endContainer: range.endContainer
    }
  };
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
  const range = collapseRangeIfInside(container);
  if (range !== null) {
    range.insertNode(document.createTextNode(cursorPlaceholder));
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