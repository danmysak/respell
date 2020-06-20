import {
  correctionTypes,
  registerWordRule,
  createMaskRule,
  isPunctuation,
  determineLetterCase,
  letterCases
} from "../imports.js";
import {masculine} from "../../data/vocative.js";

registerWordRule(createMaskRule({
  matches: ["Ігор(е)"],
  replacement: "ю",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 87 правопису, форма кличного відмінка імені «Ігор» — «Ігорю».'
}));

registerWordRule(createMaskRule({
  matches: ["Оле(гу)"],
  callback: (token, chain) => {
    const next = chain.getNextToken();
    const plausibleFollowing = isPunctuation(next, true) || (
      isPunctuation(chain.getNextToken(2), true)
      && [letterCases.CAPITALIZED, letterCases.CAMEL].includes(determineLetterCase(next))
    );
    if (!plausibleFollowing) {
      return false;
    }
    const previous = chain.getPreviousToken();
    const plausiblePreceding = isPunctuation(previous, true) || previous.match(masculine.adjectivePattern)
      || (previous.match(masculine.vocativePattern) && isPunctuation(chain.getPreviousToken(2), true));
    if (!plausiblePreceding) {
      return false;
    }
    return true;
  },
  replacement: "же",
  type: correctionTypes.UNCERTAIN,
  description: 'Відповідно до § 87 правопису, поряд із «Олегу» можна вживати форму кличного відмінка «Олеже».'
}));