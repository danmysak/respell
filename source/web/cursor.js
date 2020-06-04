import {getParentOffset, getNodeAtOffset} from "./offsets.js";

export const cursorPlaceholder = '[[CURSOR]]';

function setCursorRange(range) {
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

export function setCursorAdjacent(node, after = true) {
  const range = document.createRange();
  if (after) {
    range.setStartAfter(node);
    range.setEndAfter(node);
  } else {
    range.setStartBefore(node);
    range.setEndBefore(node);
  }
  setCursorRange(range);
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
  if (collapseToStart) {
    setCursorAdjacent(firstNode, false);
  } else {
    setCursorAdjacent(lastNode, true);
  }
  return true;
}

export function getSelectionOffsets(container, simpleOffsets = false) {
  const range = getRangeIfInside(container);
  if (range === null) {
    return null;
  }
  return {
    start: getParentOffset(container, range.startContainer, range.startOffset, simpleOffsets),
    end: getParentOffset(container, range.endContainer, range.endOffset, simpleOffsets),
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
  const end = getNodeAtOffset(container, offsets.end);
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

export function scrollSelectionIntoView(container, lineHeight) {
  const range = getRangeIfInside(container);
  if (range === null) {
    return;
  }
  const cutoffLines = 2;
  const viewportHeight = document.documentElement.clientHeight;
  const top = cutoffLines * lineHeight;
  const bottom = viewportHeight - (cutoffLines + 1) * lineHeight;
  const rect = range.getBoundingClientRect();
  let scrollDelta = null;
  if (rect.top < top) {
    scrollDelta = rect.top - top;
  } else if (rect.top >= bottom) {
    scrollDelta = rect.top - bottom;
  }
  if (scrollTo !== null) {
    window.scrollTo({
      left: window.pageXOffset,
      top: window.pageYOffset + scrollDelta,
      behavior: 'auto'
    });
  }
}