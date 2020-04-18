export const cursorPlaceholder = '__CURSOR__'; // Must be text that can be part of a token

function setCursor(node, offset) {
  const range = document.createRange();
  range.setStart(node, offset);
  range.setEnd(node, offset);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

export function getRangeIfCollapsedAndInside(node) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  const range = selection.getRangeAt(0);
  if (!range || !range.collapsed) {
    return null;
  }
  return node.contains(range.startContainer) ? range : null;
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