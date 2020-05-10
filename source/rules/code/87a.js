import {correctionTypes, registerWordRule, createMaskRule, isPunctuation, determineCase, cases} from "../imports.js";

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
      isPunctuation(chain.getNextToken(2), true) && [cases.CAPITALIZED, cases.CAMEL].includes(determineCase(next))
    );
    if (!plausibleFollowing) {
      return false;
    }
    const previous = chain.getPreviousToken();
    const plausiblePreceding = isPunctuation(previous, true) || previous.endsWith('ий')
      || (previous.match(/[еую]$/) && isPunctuation(chain.getPreviousToken(2), true));
    if (!plausiblePreceding) {
      return false;
    }
    return plausiblePreceding;
  },
  replacement: "же",
  type: correctionTypes.UNCERTAIN,
  description: 'Відповідно до § 87 правопису, поряд із «Олегу» можна вживати форму кличного відмінка «Олеже».'
}));