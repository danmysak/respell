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

const minTokenLength = 4;
const minPreviousLength = 4;

const nominativeLastLetters = Object.keys(masculine.endings);

registerWordRule((token, chain) => {
  if (!isPunctuation(chain.getNextToken(), true)) {
    return null;
  }
  if (token.length < minTokenLength || determineCase(token) !== cases.LOWER
    || !nominativeLastLetters.includes(getLastLetter(token))
    || masculine.excludedEndings.some((ending) => token.endsWith(ending))) {
    return null;
  }
  const previous = chain.getPreviousToken();
  if (previous === null || isPunctuation(previous) || previous.length < minPreviousLength
    || !previous.match(masculine.vocativePattern)) {
    return null;
  }
  const secondPrevious = chain.getPreviousToken(2);
  if (!(determineCase(previous) === cases.LOWER
    || (determineCase(previous) === cases.CAPITALIZED && canBeSentenceBoundary(secondPrevious)))) {
    return null;
  }
  if (!(isPunctuation(secondPrevious, true)
    || (secondPrevious.match(masculine.adjectivePattern) && isPunctuation(chain.getPreviousToken(3), true)))) {
    return null;
  }
  return new Correction(correctionTypes.UNCERTAIN, null,
    'Відповідно до § 87 правопису, у звертаннях до чоловіків, що складаються з двох загальних назв, форму кличного '
      + 'відмінка обов’язково мають обидва слова.',
    {
      alternatives: arrayify(masculine.endings[getLastLetter(token)]).map((ending) => token.slice(0, -1) + ending)
    }
  );
});