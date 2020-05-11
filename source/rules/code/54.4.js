import {Correction, correctionTypes, registerWordRule, canBeSentenceBoundary, isQuote} from "../imports.js";

const maxLength = 3;

function isLatin(token) {
  return token !== null && token.match(/^[^а-яґєії]*[a-z][а-яґєії]*$/i)
    && !token.match(/^[IVXLCDM]+$/); // Roman numerals
}

function canBeInitialPart(token) {
  return token.toLowerCase() !== token;
}

function navigateUntilNonLatin(navigator, maxLength) {
  let lastToken = navigator(0);
  for (let level = 1; level <= maxLength; level++) {
    const nextToken = navigator(level);
    if (!isLatin(nextToken)) {
      return [lastToken, nextToken];
    }
    lastToken = nextToken;
  }
  return [null, null];
}

function canBeSentence(precedingToken, followingToken) {
  return canBeSentenceBoundary(precedingToken) && canBeSentenceBoundary(followingToken);
}

registerWordRule((token, chain) => {
  if (!isLatin(token)) {
    return null;
  }
  const isFirst = !isLatin(chain.getPreviousToken());
  const isLast = !isLatin(chain.getNextToken());
  if (!isFirst && !isLast) {
    return null;
  }
  if (isFirst) {
    if (!canBeInitialPart(token) || isQuote(chain.getPreviousToken(1, false))) {
      return null;
    }
    const [last, following] = navigateUntilNonLatin(chain.getNextToken.bind(chain), maxLength);
    if (last === null || canBeSentence(chain.getPreviousToken(), following)) {
      return null;
    }
  }
  if (isLast) {
    if (isQuote(chain.getNextToken(1, false))) {
      return null;
    }
    const [first, preceding] = navigateUntilNonLatin(chain.getPreviousToken.bind(chain), maxLength);
    if (first === null || !canBeInitialPart(first) || canBeSentence(preceding, chain.getNextToken())) {
      return null;
    }
  }
  if (isFirst && isLast && token.replace(/[^a-z]/ig, '').length <= 1) {
    return null;
  }
  return new Correction(correctionTypes.UNCERTAIN, `${isFirst ? '«' : ''}${token}${isLast ? '»' : ''}`,
    'Відповідно до § 54 правопису, назви компаній, написані латинкою, слід брати в лапки.'
  );
}, ['latin-proper-nouns']);