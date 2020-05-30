import {processToken} from "../spelling/processor.js";
import {tokenize} from "../spelling/tokenizer.js";
import {TokenChain} from "../spelling/token-chain.js";
import {createCorrectionPresentation} from "../spelling/correction.js";
import {endPlannedMutation, startPlannedMutation} from "./input-handler.js";
import "../rules/rules.js";

const correctionPrefix = 'correction-';
const emptyCorrection = 'none';
const newCorrection = 'new';

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
  const {data, tokenIndex} = element[tokenDataSymbol] || {};
  return !data ? null : filterCorrections(data.tokenData[tokenIndex].corrections)
    .map(({presentation, id}) => ({presentation, id}));
}

export function getParagraphCorrections(paragraph) {
  return paragraph[paragraphDataSymbol].tokenData.map(({element, start, end, corrections}) => ({
    element,
    start,
    end,
    corrections: filterCorrections(corrections).map(({correction}) => ({correction}))
  }));
}

function setTokenAttributes(tokenElement) {
  const presentations = getTokenCorrectionPresentations(tokenElement);
  tokenElement.classList.add(
    correctionPrefix + (presentations.length === 0 ? emptyCorrection : presentations[0].presentation.type)
  );
  tokenElement.tabIndex = presentations.length === 0 ? -1 : 0;
}

export function getTokenLabelUpdater() {
  return (element) => {
    for (const className of [...element.classList]) {
      if (className.startsWith(correctionPrefix)) {
        element.classList.remove(className);
      }
    }
    setTokenAttributes(element);
  };
}

export function spellcheck(paragraph, withAnimations, replacer) {
  const tokens = tokenize(paragraph.textContent);
  const tokenChain = new TokenChain(tokens);
  const normalizedTokens = tokenChain.getTokens();
  let start = 0;
  const tokenData = [];
  while (tokenChain.hasMore()) {
    tokenChain.next();
    const currentToken = tokenChain.getCurrentToken(false);
    const end = start + currentToken.length;
    tokenData.push({
      element: null, // To be assigned later
      token: currentToken,
      start,
      end,
      corrections: processToken(tokenChain).map(({correction, labels}, index) => ({
        presentation: createCorrectionPresentation(correction, tokens, normalizedTokens, tokenChain.getCurrentIndex()),
        correction,
        labels,
        id: index
      }))
    });
    start = end;
  }
  const data = {
    replacer,
    tokenData
  };
  paragraph[paragraphDataSymbol] = data;
  return tokens.map((token, index) => ({
    token,
    callback: tokenData[index].corrections.length === 0 ? null : (element, isNew) => {
      tokenData[index].element = element;
      element[tokenDataSymbol] = {
        data,
        tokenIndex: index
      };
      setTokenAttributes(element);
      if (withAnimations && isNew) {
        const newCorrectionClassName = correctionPrefix + newCorrection;
        element.classList.add(newCorrectionClassName);
        setTimeout(() => {
          startPlannedMutation();
          window.getComputedStyle(element).color; // Forces Firefox to respect the color transition
          element.classList.remove(newCorrectionClassName);
          endPlannedMutation();
        }, 0);
      }
    }
  }));
}

export function accept(tokenElement, correctionId, replacementIndex) {
  const {data, tokenIndex} = tokenElement[tokenDataSymbol];
  const {replacer, tokenData} = data;
  const {start, end, corrections} = tokenData[tokenIndex];
  const correction = corrections.find(({id}) => id === correctionId).correction;
  const getOffset = (shouldRemove, shift) => {
    const index = tokenIndex + shift;
    return shouldRemove && index >= 0 && index < tokenData.length ? tokenData[index].token.length : 0;
  };
  replacer(
    start - getOffset(correction.removePreviousToken, -1),
    end + getOffset(correction.removeNextToken, 1),
    correction.replacements[replacementIndex]
  );
}