import {cursorPlaceholder, serializeCursor, restoreCursor} from "./cursor.js";
import {paragraphTag, tokenTag} from "./common-tags.js";

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

function removeLineBreaks(inputElement) {
  for (const br of [...inputElement.querySelectorAll('br')]) {
    br.remove();
  }
}

export function normalize(inputElement, paragraphsToSkip) {
  if (!inputElement.hasChildNodes()) {
    const emptyParagraph = document.createElement(paragraphTag);
    emptyParagraph.textContent = cursorPlaceholder;
    inputElement.append(emptyParagraph);
  } else {
    serializeCursor(inputElement);
  }
  removeLineBreaks(inputElement); // Simply replacing line breaks with '\n' doesn't work well in Firefox (it treats
                                  // trailing '\n' as actual text rather than as end-of-contenteditable-element)
  paragraphize(inputElement, paragraphsToSkip);
  restoreCursor(inputElement);
  return [...inputElement.children];
}