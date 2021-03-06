import {
  Correction,
  correctionTypes,
  registerWordRule,
  labels,
  canBeSentenceBoundary,
  isWord,
  isQuote,
  isRomanNumeral
} from "../imports.js";

const maxWords = 3;
const minSingleLength = 2;

const commonPhrases = [
  "ad hoc",
  "alma mater",
  "alter ego",
  "a posteriori", "a priori",
  "ave",
  "de facto", "de iure",
  "in situ", "in vitro", "in vivo",
  "persona non grata",
  "pro bono",
  "sic",
  "status quo"
];

function isLatin(token) {
  return token !== null
    && token.match(/^[^а-яґєії]*[a-z][^а-яґєії]*$/i)
    && !token.includes('.')
    && !isRomanNumeral(token);
}

function isCyrillic(token) {
  return token !== null && token.match(/[а-яґєії]/);
}

function canBeInitialPart(token) {
  return token.toLowerCase() !== token;
}

function navigateUntilNonLatin(navigator, maxWords) {
  let lastToken = navigator(0);
  for (let level = 1; level <= maxWords; level++) {
    const nextToken = navigator(level);
    if (!isLatin(nextToken)) {
      return [lastToken, level];
    }
    lastToken = nextToken;
  }
  return [null, null];
}

function lookForCyrillic(navigator, startingLevel) {
  let level = startingLevel;
  while (true) {
    const token = navigator(level);
    if (canBeSentenceBoundary(token)) {
      return false;
    } else if (isWord(token)) {
      return isCyrillic(token);
    }
    level++;
  }
}

function hasCyrillic(chain, precedingLevel, followingLevel) {
  return lookForCyrillic(chain.getPreviousToken.bind(chain), precedingLevel)
    || lookForCyrillic(chain.getNextToken.bind(chain), followingLevel);
}

function isCommonPhrase(chain, fromLevel, toLevel) {
  const phrase = [];
  for (let level = fromLevel; level <= toLevel; level++) {
    phrase.push(chain.getAdjacentToken(level, true));
  }
  return commonPhrases.includes(phrase.join(' ').toLowerCase());
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
    const [last, followingLevel] = navigateUntilNonLatin(chain.getNextToken.bind(chain), maxWords);
    if (last === null || !hasCyrillic(chain, 1, followingLevel)
      || isCommonPhrase(chain, 0, followingLevel - 1)) {
      return null;
    }
  }
  if (isLast) {
    if (isQuote(chain.getNextToken(1, false))) {
      return null;
    }
    const [first, precedingLevel] = navigateUntilNonLatin(chain.getPreviousToken.bind(chain), maxWords);
    if (first === null || !canBeInitialPart(first) || !hasCyrillic(chain, precedingLevel, 1)
      || isCommonPhrase(chain, -(precedingLevel - 1), 0)) {
      return null;
    }
  }
  if (isFirst && isLast && token.replace(/[^a-z]/ig, '').length <= minSingleLength) {
    return null;
  }
  return new Correction(correctionTypes.UNCERTAIN, `${isFirst ? '«' : ''}${token}${isLast ? '»' : ''}`,
    'Відповідно до § 54 правопису, назви компаній, написані латинкою, слід брати в лапки.'
  );
}, [labels.LATIN_PROPER_NOUNS]);