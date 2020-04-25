import {processToken} from "../spelling/processor.js";
import {TokenChain} from "../spelling/types.js";
import "../rules/rules.js";

const correctionClass = 'correction';

const tokenMap = new WeakMap();

function setCorrectionAttributes(token, correctionType) {
  token.classList.add(correctionClass, `${correctionClass}-${correctionType}`);
  token.tabIndex = 0;
}

function checkToken(tokenChain) {
  const application = processToken(tokenChain);
  const container = tokenChain.getCurrentContainer();
  if (application !== null) {
    setCorrectionAttributes(container, application.type);
  }
  tokenMap.set(container, application);
  return application;
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

export function spellcheck(inputElement) {
  const applicationSets = [];
  for (const paragraph of [...inputElement.children]) {
    const tokenChain = new TokenChain([...paragraph.children], (container) => container.textContent);
    const applications = [];
    while (tokenChain.hasMore()) {
      tokenChain.next();
      applications.push(checkToken(tokenChain));
    }
    applicationSets.push(applications);
  }
  return applicationSets;
}

export function getTokenRuleApplication(tokenElement) {
  return tokenMap.get(tokenElement) || null;
}