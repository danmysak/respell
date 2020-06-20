import {tokenTag} from "./common-tags.js";

export function getParentWithOffset(condition, node, offset) {
  let currentNode, currentOffset;
  const result = (parent, offset) => ({parent, offset});
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
    return result(null, 0);
  }
  while (!condition(currentNode)) {
    if (currentNode.parentElement === null) {
      return result(null, currentOffset);
    }
    let currentSibling = currentNode.parentElement.firstChild;
    while (currentSibling !== currentNode) {
      currentOffset += currentSibling.textContent.length;
      currentSibling = currentSibling.nextSibling;
    }
    currentNode = currentNode.parentElement;
  }
  return result(currentNode, currentOffset);
}

export function getParentOffset(container, node, offset, simpleOffset = false) {
  const containerOffset = getParentWithOffset((node) => node === container, node, offset).offset;
  if (simpleOffset) {
    return containerOffset;
  }
  const {parent, offset: parentOffset} = getParentWithOffset((node) => node.parentElement === container, node, offset);
  let skipChildren = 0;
  if (parent !== null && parentOffset === 0) {
    let currentSibling = parent.previousSibling;
    while (currentSibling !== null) {
      skipChildren++;
      if (currentSibling.textContent.length > 0) {
        break;
      }
      currentSibling = currentSibling.previousSibling;
    }
  }
  return {
    containerOffset,
    skipChildren
  };
}

function getFirstNodeAtOffset(parent, offset) {
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
      };
    }
  }
}

function expand({node, offset}) {
  // If adjacent to a token element's opening/closing tag, selection needs to expand beyond it: otherwise the element
  // will not be removed upon pressing Delete or, more importantly, when performing a correction. In particular, this
  // may happen if the element is at the very beginning of a paragraph.
  let currentNode = node;
  let currentOffset = offset;
  const up = () => {
    currentOffset = [...currentNode.parentElement.childNodes].indexOf(currentNode) + (currentOffset === 0 ? 0 : 1);
    currentNode = currentNode.parentElement;
  };
  if (currentNode.nodeType === Node.TEXT_NODE
    && (currentOffset === 0 || currentOffset === currentNode.textContent.length)) {
    up();
  }
  if (currentNode.nodeType === Node.ELEMENT_NODE && currentNode.tagName === tokenTag
    && (currentOffset === 0 || currentOffset === currentNode.childNodes.length)) {
    up();
  }
  return {
    node: currentNode,
    offset: currentOffset
  };
}

export function getNodeAtOffset(container, containerOffsetData) {
  let containerOffset;
  let skipChildren;
  if (typeof containerOffsetData === 'number') {
    containerOffset = containerOffsetData;
    skipChildren = 0;
  } else {
    ({containerOffset, skipChildren} = containerOffsetData);
  }
  const {node, offset} = expand(getFirstNodeAtOffset(container, containerOffset));
  if (skipChildren > 0 && node !== container) {
    let currentNode = node;
    while (currentNode.parentElement !== container) {
      currentNode = currentNode.parentElement;
    }
    let leftToSkip = skipChildren;
    let currentOffset = offset;
    while (leftToSkip > 0 && currentNode.nextSibling !== null) {
      leftToSkip--;
      currentNode = currentNode.nextSibling;
      currentOffset = 0;
    }
    return {
      node: currentNode,
      offset: currentOffset
    };
  } else {
    return {
      node,
      offset
    };
  }
}