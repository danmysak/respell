import {
  registerWordRule,
  Correction,
  correctionTypes,
  determineCase,
  cases,
  getLastLetter,
  isPunctuation,
  canBeSentenceBoundary,
  arrayify
} from "../imports.js";
import {masculine} from "../data/vocative.js";

const minCommonTokenLength = 4;
const minProperTokenLength = 3;
const minPreviousLength = 4;

const vocativePattern = masculine.vocativePattern;
const adjectivePattern = masculine.adjectivePattern;

function inspectPreceding(chain, minPreviousLength) {
  const previous = chain.getPreviousToken();
  if (previous === null || isPunctuation(previous) || previous.length < minPreviousLength
    || !previous.match(vocativePattern)) {
    return false;
  }
  const secondPrevious = chain.getPreviousToken(2);
  if (!(determineCase(previous) === cases.LOWER
    || (determineCase(previous) === cases.CAPITALIZED && canBeSentenceBoundary(secondPrevious)))) {
    return false;
  }
  if (!(isPunctuation(secondPrevious, true)
    || (secondPrevious.match(adjectivePattern) && isPunctuation(chain.getPreviousToken(3), true)))) {
    return false;
  }
  return true;
}

function registerRule({
    endings, excludedEndings, endingRequirements = {},
    allowedCases, minTokenLength, minPreviousLength,
    description
  }) {
  registerWordRule((token, chain) => {
    if (!isPunctuation(chain.getNextToken())) {
      return null;
    }
    const lastLetter = getLastLetter(token);
    if (token.length < minTokenLength || !allowedCases.includes(determineCase(token))
      || !Object.keys(endings).includes(lastLetter)
      || (endingRequirements.hasOwnProperty(lastLetter) && !token.match(endingRequirements[lastLetter]))
      || excludedEndings.some((ending) => token.endsWith(ending))) {
      return null;
    }
    if (!inspectPreceding(chain, minPreviousLength)) {
      return null;
    }
    return new Correction(correctionTypes.UNCERTAIN, null, description,
      {
        alternatives: arrayify(endings[getLastLetter(token)]).map((ending) => token.slice(0, -1) + ending)
      }
    );
  });
}

registerRule({
  endings: masculine.endings,
  excludedEndings: masculine.excludedEndings,
  allowedCases: [cases.LOWER],
  minTokenLength: minCommonTokenLength,
  minPreviousLength,
  description: 'Відповідно до § 87 правопису, у звертаннях до чоловіків, що складаються з двох загальних назв, форму '
    + 'кличного відмінка обов’язково мають обидва слова.'
});

registerRule({
  endings: {
    ...masculine.endings,
    ...masculine.specificLastNameEndings
  },
  excludedEndings: masculine.excludedEndings,
  endingRequirements: masculine.lastNameRequirements,
  allowedCases: [cases.CAPITALIZED, cases.CAMEL],
  minTokenLength: minProperTokenLength,
  minPreviousLength,
  description: 'Відповідно до § 87 правопису, у звертаннях до чоловіків, що складаються з загальної назви та прізвища, '
    + 'прізвище (як і загальна назва) може набувати форми кличного відмінка.'
});