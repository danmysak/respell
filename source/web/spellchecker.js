import {processToken} from "../spelling/processor.js";
import {TokenChain} from "../spelling/token-chain.js";
import "../rules/rules.js";

const correctionClass = 'correction';

const tokenMap = new WeakMap();

function setCorrectionAttributes(token, correctionType) {
  token.classList.add(correctionClass, `${correctionClass}-${correctionType}`);
  token.tabIndex = 0;
}

function checkToken(tokenChain, ignoredLabels) {
  const corrections = processToken(tokenChain, ignoredLabels);
  const container = tokenChain.getCurrentContainer();
  if (corrections !== null) {
    setCorrectionAttributes(container, corrections[0].type);
  }
  tokenMap.set(container, corrections);
  return corrections;
}

export function findNextCorrection(token) {
  let currentParagraph = token.parentElement;
  const siblingCorrections = [...currentParagraph.querySelectorAll(`.${correctionClass}`)];
  const index = siblingCorrections.indexOf(token);
  if (index === -1) {
    return null;
  }
  if (index + 1 < siblingCorrections.length) {
    return siblingCorrections[index + 1];
  }
  while (true) {
    currentParagraph = currentParagraph.nextElementSibling;
    if (currentParagraph === null) {
      return null;
    }
    const correction = currentParagraph.querySelector(`.${correctionClass}`);
    if (correction) {
      return correction;
    }
  }
}

export function spellcheck(inputElement, ignoredLabels) {
  const correctionSets = [];
  for (const paragraph of [...inputElement.children]) {
    const tokenChain = new TokenChain([...paragraph.children], (container) => container.textContent);
    const corrections = [];
    while (tokenChain.hasMore()) {
      tokenChain.next();
      corrections.push(checkToken(tokenChain, ignoredLabels));
    }
    correctionSets.push(corrections);
  }
  return correctionSets;
}

export function getTokenCorrections(tokenElement) {
  return tokenMap.get(tokenElement) || null;
}