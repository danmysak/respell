import {getSelectionOffsets, setSelectionOffsets} from "./cursor.js";
import {tokenTag} from "./common-tags.js";

function removeAttributes(element) {
  for (const attribute of [...element.attributes]) {
    element.removeAttribute(attribute.name);
  }
}

export function merge(paragraph, data) {
  const selection = getSelectionOffsets(paragraph, true);
  removeAttributes(paragraph);

  const splitNode = (node, at, insertAfter) => {
    const first = node.textContent.slice(0, at);
    const last = node.textContent.slice(at);
    const textNode = document.createTextNode('');
    [node.textContent, textNode.textContent] = insertAfter ? [first, last] : [last, first];
    node[insertAfter ? 'after' : 'before'](textNode);
  };

  let currentNode = paragraph.firstChild;
  let currentOffset = 0;

  const textifyAhead = (chars = Infinity, splitLast = false) => {
    let charsLeft = chars;
    while (charsLeft > 0 && currentNode !== null) {
      const leftInNode = currentNode.textContent.length - currentOffset;
      if (currentNode.nodeType === Node.ELEMENT_NODE) { // currentOffset must be 0 in this case
        if (leftInNode <= charsLeft) {
          const textNode = document.createTextNode(currentNode.textContent);
          currentNode.replaceWith(textNode);
          currentNode = textNode;
        } else {
          splitNode(currentNode, charsLeft, false);
          charsLeft = 0;
        }
      } else { // Text node
        if (leftInNode <= charsLeft) {
          charsLeft -= leftInNode;
          currentNode = currentNode.nextSibling;
          currentOffset = 0;
        } else {
          currentOffset += charsLeft;
          if (splitLast) {
            splitNode(currentNode, currentOffset, false);
            currentOffset = 0;
          }
          charsLeft = 0;
        }
      }
    }
  };

  for (const {token, callback} of data) {
    let leftInToken = token.length;
    if (callback === null) { // No callback means the token shouldn't be wrapped in an element
      textifyAhead(leftInToken);
    } else { // The token should be wrapped in an element and this element should be passed to the callback
      if (currentOffset > 0) { // Only possible for text nodes
        splitNode(currentNode, currentOffset, false);
        currentOffset = 0;
      }
      const textNodesToPrepend = [];
      while (leftInToken > 0 && currentNode.nodeType !== Node.ELEMENT_NODE) { // Text node
        if (currentNode.textContent.length > leftInToken) {
          splitNode(currentNode, leftInToken, true);
        }
        leftInToken -= currentNode.textContent.length;
        textNodesToPrepend.push(currentNode);
        currentNode = currentNode.nextSibling;
      }
      if (leftInToken === 0) { // No elements found
        const element = document.createElement(tokenTag);
        if (currentNode === null) {
          paragraph.append(element);
        } else {
          currentNode.before(element);
        }
        element.prepend(...textNodesToPrepend);
        currentNode = element.nextSibling;
        callback(element, true);
      } else { // currentNode is an element
        removeAttributes(currentNode);
        currentNode.prepend(...textNodesToPrepend);
        const element = currentNode;
        if (currentNode.textContent.length > token.length) {
          splitNode(currentNode, token.length, true);
          currentNode = currentNode.nextSibling;
        } else {
          currentNode = currentNode.nextSibling;
          textifyAhead(token.length - element.textContent.length, true);
          while (element.nextSibling !== currentNode) {
            element.append(element.nextSibling);
          }
        }
        callback(element, false);
      }
    }
  }
  textifyAhead();
  setSelectionOffsets(paragraph, selection);
}