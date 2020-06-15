import {
  Correction,
  correctionTypes,
  registerWordRule,
  determineLetterCase,
  letterCases,
  canBeSentenceBoundary
} from "../imports.js";

const prefixes = ["за", "навколо", "перед", "при"];
const exceptionPrefixes = ["приват"];
const endings = ["а", "е", "ий", "им", "ими", "их", "і", "ій", "ім", "ого", "ої", "ому", "ою", "у"];

const pattern = new RegExp(
  `^(?!${exceptionPrefixes.join('|')})(${prefixes.join('|')}).+[^о]-[^-]{2,}[зсц]ьк(${endings.join('|')})$`, 'i'
); // There are a lot of words like "прибалтійсько-фінський", so we exclude "о"

registerWordRule((token, chain) => {
  if (!token.match(pattern)) {
    return null;
  }
  const letterCase = determineLetterCase(token);
  if (!(letterCase === letterCases.LOWER
    || (letterCase === letterCases.CAPITALIZED && canBeSentenceBoundary(chain.getPreviousToken()))
  )) {
    return null;
  }
  return new Correction(correctionTypes.UNCERTAIN, token.replace(/-/g, ''),
    'Відповідно до § 154 правопису, прикметники, утворені шляхом приєднання префікса до географічної назви, '
      + 'що містить дефіс, слід писати без дефісів.');
});