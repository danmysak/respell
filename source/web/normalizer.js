import {cursorPlaceholder, serializeCursor, restoreCursor, getRangeIfInside} from "./cursor.js";
import {tokenize} from "../spelling/tokenizer.js";

export const paragraphTag = 'P';
const tokenTag = 'T-T';
const cursorClass = 'cursor-around';

function isTokenTag(node) {
  return node !== null && node.nodeType === Node.ELEMENT_NODE && node.tagName === tokenTag;
}

function isTokenTagWithText(node, text = null) {
  return isTokenTag(node) && (text === null || node.textContent === text) &&
      [...node.childNodes].every((childNode) => childNode.nodeType === Node.TEXT_NODE); // Text nodes can be split
}

function paragraphize(inputElement, extraTagsToRemove) {
  const paragraphLikeTags = ['DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
  const tagsToRemove = ['STYLE', ...extraTagsToRemove];
  let currentParagraph = null;
  let node = inputElement.hasChildNodes() ? inputElement.childNodes[0] : null;
  while (node !== null) {
    let nextNode = node.nextSibling;
    if (node.nodeType === Node.TEXT_NODE || isTokenTagWithText(node)) {
      if (currentParagraph === null) {
        currentParagraph = document.createElement(paragraphTag);
        inputElement.prepend(currentParagraph);
      }
      currentParagraph.append(node);
    } else if (node.nodeType !== Node.ELEMENT_NODE || tagsToRemove.includes(node.tagName)) {
      node.remove();
    } else {
      const isParagraph = node.tagName === paragraphTag;
      if (!isParagraph || ![...node.childNodes].every((childNode) => isTokenTagWithText(childNode))) {
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
  let br;
  while ((br = inputElement.querySelector('br'))) {
    br.replaceWith('\n');
  }
}

function removeAttributes(element) {
  for (const child of [...element.children]) {
    removeAttributes(child);
  }
  for (const className of [...element.classList]) {
    // We need to preserve the cursor class so that pseudo-elements are not recreated and transitions are not broken
    if (className !== cursorClass) {
      element.classList.remove(className);
    }
  }
  for (const attribute of [...element.attributes]) {
    if (attribute.name !== 'class') {
      element.removeAttribute(attribute.name);
    }
  }
}

function normalizeParagraph(paragraph) {
  const children = paragraph.childNodes;
  const tokens = tokenize(paragraph.textContent);
  let left = 0;
  while (left < tokens.length && left < children.length
         && isTokenTagWithText(children[left], tokens[left])) {
    left++;
  }
  let right = 0;
  while (left + right < tokens.length && left + right < children.length
         && isTokenTagWithText(children[children.length - 1 - right], tokens[tokens.length - 1 - right])) {
    right++;
  }
  while (left + right < tokens.length && left + right < children.length && isTokenTag(children[left])) {
    children[left].textContent = tokens[left];
    left++;
  }
  for (let current = children.length - 1 - right; current >= left; current--) {
    children[current].remove();
  }
  for (let current = tokens.length - 1 - right; current >= left; current--) {
    const token = document.createElement(tokenTag);
    if (left === 0) {
      paragraph.prepend(token);
    } else {
      children[left - 1].after(token);
    }
    token.textContent = tokens[current];
  }
  removeAttributes(paragraph);
}

export function normalizeCursorClasses(inputElement) {
  const getCursorElements = () => {
    const range = getRangeIfInside(inputElement);
    if (!range) {
      return [];
    }
    return [range.startContainer, range.endContainer].flatMap((container) => {
      const token = [container, container.parentElement].find((candidate) => isTokenTag(candidate));
      if (!token) {
        return [];
      }
      return [token, token.previousElementSibling, token.nextElementSibling].filter((element) => element !== null);
    });
  };
  const cursorElements = getCursorElements();
  for (const element of [...inputElement.querySelectorAll(`.${cursorClass}`)]) {
    if (!cursorElements.includes(element)) {
      element.classList.remove(cursorClass);
    }
  }
  cursorElements.forEach((element) => {
    element.classList.add(cursorClass);
  });
}

function trim(paragraph) {
  for (const childType of ['firstElementChild', 'lastElementChild']) {
    while (paragraph[childType] && paragraph[childType].textContent.trim() === '') {
      paragraph[childType].remove();
    }
  }
  if (paragraph.textContent.trim() === '') {
    paragraph.remove();
  }
}

export function normalize(inputElement, extraTagsToRemove, trimWhitespace) {
  if (!inputElement.hasChildNodes()) {
    const emptyParagraph = document.createElement('p');
    emptyParagraph.textContent = cursorPlaceholder + '\n';
    inputElement.append(emptyParagraph);
  } else {
    serializeCursor(inputElement);
  }
  substituteLineBreaks(inputElement);
  paragraphize(inputElement, extraTagsToRemove);
  for (const paragraph of [...inputElement.children]) {
    normalizeParagraph(paragraph);
  }
  restoreCursor(inputElement);
  if (trimWhitespace) { // We must trim after restoring the cursor, as its placeholder will be at the end of the text
    for (const paragraph of [...inputElement.children]) {
      trim(paragraph);
    }
  }
  normalizeCursorClasses(inputElement);
}