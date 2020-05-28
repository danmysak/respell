import {processToken} from "../spelling/processor.js";
import {tokenize} from "../spelling/tokenizer.js";
import {TokenChain} from "../spelling/token-chain.js";
import {createCorrectionPresentation} from "../spelling/correction.js";
import "../rules/rules.js";

const correctionPrefix = 'correction-';
const emptyCorrection = 'none';

const paragraphDataSymbol = Symbol('paragraph-data');
const tokenDataSymbol = Symbol('token-data');

let ignoredLabels = {};

export function setLabelStatus(label, active) {
  ignoredLabels[label] = !active;
}

function filterCorrections(corrections) {
  return corrections.filter(({labels}) => !labels.some((label) => ignoredLabels[label]));
}

export function getTokenCorrectionPresentations(element) {
  const data = element[tokenDataSymbol];
  return !data ? null : filterCorrections(data.corrections)
    .map(({presentation, id}) => ({presentation, id}));
}

export function getParagraphCorrectionSets(paragraph) {
  return paragraph[paragraphDataSymbol].correctionSets.map(
    (corrections) => filterCorrections(corrections).map(({correction}) => correction)
  );
}

function computeTokenCurrentClass(tokenElement) {
  const presentations = getTokenCorrectionPresentations(tokenElement);
  return correctionPrefix + (presentations.length === 0 ? emptyCorrection : presentations[0].presentation.type);
}

export function getTokenLabelUpdater() {
  return (element) => {
    for (const className of [...element.classList]) {
      if (className.startsWith(correctionPrefix)) {
        element.classList.remove(className);
      }
    }
    element.classList.add(computeTokenCurrentClass(element));
  };
}

export function spellcheck(paragraph, replacer) {
  const tokens = tokenize(paragraph.textContent);
  const tokenChain = new TokenChain(tokens);
  const normalizedTokens = tokenChain.getTokens();
  const correctionSets = [];
  while (tokenChain.hasMore()) {
    tokenChain.next();
    correctionSets.push(processToken(tokenChain).map(({correction, labels}, index) => ({
      presentation: createCorrectionPresentation(correction, tokens, normalizedTokens, tokenChain.getCurrentIndex()),
      correction,
      labels,
      id: index
    })));
  }
  paragraph[paragraphDataSymbol] = {
    correctionSets
  };
  return tokens.map((token, index) => ({
    token,
    callback: correctionSets[index].length === 0 ? null : (element) => {
      element[tokenDataSymbol] = {
        corrections: correctionSets[index],
        tokens,
        tokenIndex: index,
        replacer
      };
      element.classList.add(computeTokenCurrentClass(element));
      element.tabIndex = 0;
    }
  }));
}

export function accept(tokenElement, correctionId, replacementIndex) {
  const data = tokenElement[tokenDataSymbol];
  const correction = data.corrections.find(({id}) => id === correctionId).correction;
  const tokens = data.tokens;
  const tokenIndex = data.tokenIndex;
  let left = 0;
  for (let index = 0; index < tokenIndex; index++) {
    left += tokens[index].length;
  }
  const leftOffset = correction.removePreviousToken && tokenIndex > 0 ? tokens[tokenIndex - 1].length : 0;
  const right = left + tokens[tokenIndex].length;
  const rightOffset = correction.removeNextToken && tokenIndex + 1 < tokens.length ? tokens[tokenIndex + 1].length : 0;
  data.replacer(left - leftOffset, right + rightOffset, correction.replacements[replacementIndex]);
}