import {
  registerWordRule,
  Correction,
  correctionTypes,
  determineLetterCase,
  letterCases,
  getLastLetter,
  simplifyApostrophe,
  isPunctuation,
  isQuote,
  isAfterSentenceBoundary,
  arrayify
} from "../imports.js";
import {masculine, feminine} from "../../data/vocative.js";

const minCommonTokenLength = 4;
const minMasculineProperTokenLength = 3;
const minFeminineProperTokenLength = 4;

function inspectPreceding(chain, minPreviousLength, shorterTitlesLowerCased, vocativePattern, adjectivePattern) {
  const previous = chain.getPreviousToken();
  if (previous === null || isPunctuation(previous)
    || (previous.length < minPreviousLength && !shorterTitlesLowerCased.includes(previous.toLowerCase()))
    || !previous.match(vocativePattern)) {
    return false;
  }
  const secondPrevious = chain.getPreviousToken(2);
  if (!(determineLetterCase(previous) === letterCases.LOWER
    || (determineLetterCase(previous) === letterCases.CAPITALIZED && isAfterSentenceBoundary(chain, 2)))) {
    return false;
  }
  if (isPunctuation(secondPrevious, true)) {
    return secondPrevious;
  }
  const thirdPrevious = chain.getPreviousToken(3);
  if (secondPrevious.match(adjectivePattern) && isPunctuation(thirdPrevious, true)) {
    return thirdPrevious;
  }
  return false;
}

function inspectDelimiters(preceding, following) {
  if (isQuote(preceding) && isQuote(following)) {
    return false;
  }
  if (preceding === ')' || following === '(') {
    return false;
  }
  return true;
}

function registerRule({
    vocativePattern, adjectivePattern,
    endings, excludedEndings = [], endingRequirements = {},
    allowedCases, minTokenLength, minPreviousLength, shorterTitles,
    description
  }) {
  const shorterTitlesLowerCased = shorterTitles.map((title) => title.toLowerCase());
  registerWordRule((token, chain) => {
    const followingDelimiter = chain.getNextToken();
    if (!isPunctuation(followingDelimiter)) {
      return null;
    }
    const lastLetter = getLastLetter(token);
    if (token.length < minTokenLength || !allowedCases.includes(determineLetterCase(token))
      || !Object.keys(endings).includes(lastLetter)
      || (endingRequirements.hasOwnProperty(lastLetter) && !token.match(endingRequirements[lastLetter]))
      || excludedEndings.some((ending) => token.endsWith(ending))) {
      return null;
    }
    const precedingDelimiter =
      inspectPreceding(chain, minPreviousLength, shorterTitlesLowerCased, vocativePattern, adjectivePattern);
    if (precedingDelimiter === false || !inspectDelimiters(precedingDelimiter, followingDelimiter)) {
      return null;
    }
    const replacements = arrayify(endings[lastLetter]).map((ending) => {
      const stem = token.slice(0, -1);
      const actualEnding = typeof ending !== 'object' ? ending : (Object.entries(ending).find(
        ([_, options]) => options !== null && options.includes(simplifyApostrophe(getLastLetter(stem)))
      ) || Object.entries(ending).find(([_, options]) => options === null))[0];
      return stem + actualEnding;
    });
    return new Correction(correctionTypes.UNCERTAIN, replacements, description);
  });
}

registerRule({
  vocativePattern: feminine.vocativePattern,
  adjectivePattern: feminine.adjectivePattern,
  endings: feminine.endings,
  allowedCases: [letterCases.CAPITALIZED, letterCases.CAMEL],
  minTokenLength: minFeminineProperTokenLength,
  minPreviousLength: feminine.minTitleLength,
  shorterTitles: feminine.shorterTitles,
  description: 'Відповідно до § 74 правопису, у звертаннях до жінок, що складаються з загальної назви та прізвища, '
    + 'прізвище (як і загальна назва) набуває форми кличного відмінка.'
});

registerRule({
  vocativePattern: masculine.vocativePattern,
  adjectivePattern: masculine.adjectivePattern,
  endings: masculine.endings,
  excludedEndings: masculine.excludedEndings,
  allowedCases: [letterCases.LOWER],
  minTokenLength: minCommonTokenLength,
  minPreviousLength: masculine.minTitleLength,
  shorterTitles: masculine.shorterTitles,
  description: 'Відповідно до § 87 правопису, у звертаннях до чоловіків, що складаються з двох загальних назв, форму '
    + 'кличного відмінка обов’язково мають обидва слова.'
});

registerRule({
  vocativePattern: masculine.vocativePattern,
  adjectivePattern: masculine.adjectivePattern,
  endings: {
    ...masculine.endings,
    ...masculine.specificLastNameEndings
  },
  excludedEndings: masculine.excludedEndings,
  endingRequirements: masculine.lastNameRequirements,
  allowedCases: [letterCases.CAPITALIZED, letterCases.CAMEL],
  minTokenLength: minMasculineProperTokenLength,
  minPreviousLength: masculine.minTitleLength,
  shorterTitles: masculine.shorterTitles,
  description: 'Відповідно до § 87 правопису, у звертаннях до чоловіків, що складаються з загальної назви та прізвища, '
    + 'прізвище (як і загальна назва) може набувати форми кличного відмінка.'
});