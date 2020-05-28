import {cursorPlaceholder, serializeCursor, restoreCursor, getSelectionOffsets, setSelectionOffsets} from "./cursor.js";

export const paragraphTag = 'P';
const tokenTag = 'T-T';

function isTokenTag(node) {
  return node !== null && node.nodeType === Node.ELEMENT_NODE && node.tagName === tokenTag;
}

function isTokenTagWithText(node, text = null) {
  return isTokenTag(node) && (text === null || node.textContent === text) &&
      [...node.childNodes].every((childNode) => childNode.nodeType === Node.TEXT_NODE); // Text nodes can be split
}

function isAcceptableChildNode(node) {
  return node.nodeType === Node.TEXT_NODE || isTokenTagWithText(node);
}

function paragraphize(inputElement, paragraphsToSkip) {
  const paragraphLikeTags = ['DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
  const tagsToRemove = ['STYLE'];
  let lastParagraph = null;
  let currentParagraph = null;
  let node = inputElement.hasChildNodes() ? inputElement.childNodes[0] : null;
  while (node !== null) {
    let nextNode = node.nextSibling;
    if (isAcceptableChildNode(node)) {
      if (currentParagraph === null) {
        currentParagraph = document.createElement(paragraphTag);
        if (lastParagraph === null) {
          inputElement.prepend(currentParagraph);
        } else {
          lastParagraph.after(currentParagraph);
        }
      }
      currentParagraph.append(node);
    } else if (node.nodeType !== Node.ELEMENT_NODE || tagsToRemove.includes(node.tagName)) {
      node.remove();
    } else {
      const isParagraph = node.tagName === paragraphTag;
      const shouldBeSkipped = isParagraph &&
        (paragraphsToSkip.has(node) || [...node.childNodes].every(isAcceptableChildNode));
      if (shouldBeSkipped) {
        lastParagraph = node;
        currentParagraph = null;
      } else {
        if (node.hasChildNodes()) {
          nextNode = node.firstChild;
          do {
            node.after(node.lastChild);
          } while (node.hasChildNodes());
        }
        if (isParagraph) {
          currentParagraph = node;
        } else {
          if (paragraphLikeTags.includes(node.tagName)) {
            const paragraph = document.createElement(paragraphTag);
            node.after(paragraph);
            currentParagraph = paragraph;
          }
          node.remove();
        }
      }
    }
    node = nextNode;
  }
}

function substituteLineBreaks(inputElement) {
  for (const br of [...inputElement.querySelectorAll('br')]) {
    br.replaceWith('\n');
  }
}

export function normalize(inputElement, paragraphsToSkip) {
  if (!inputElement.hasChildNodes()) {
    const emptyParagraph = document.createElement(paragraphTag);
    emptyParagraph.textContent = cursorPlaceholder + '\n';
    inputElement.append(emptyParagraph);
  } else {
    serializeCursor(inputElement);
  }
  substituteLineBreaks(inputElement);
  paragraphize(inputElement, paragraphsToSkip);
  restoreCursor(inputElement);
}

function removeAttributes(element) {
  for (const attribute of [...element.attributes]) {
    element.removeAttribute(attribute.name);
  }
}

export function merge(paragraph, data) {
  const selection = getSelectionOffsets(paragraph);
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

  const textifyAhead = (chars, splitLast = false) => {
    let charsLeft = chars;
    while (charsLeft > 0) {
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
        callback(element);
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
        callback(element);
      }
    }
  }

  setSelectionOffsets(paragraph, selection);
}

export function updateTokens(paragraph, callback) {
  [...paragraph.children].forEach((token) => callback(token));
}