import {correctionTypes, registerWordRule, createMaskRule, isPunctuation, determineCase, cases} from "../imports.js";
import {masculine} from "../data/vocative.js";

registerWordRule(createMaskRule({
  matches: [
    [["повстан", "уміль"], "(цю)"]
  ],
  callback: (token, chain) => {
    const next = chain.getNextToken();
    const plausibleFollowing = isPunctuation(next, true) || (
      isPunctuation(chain.getNextToken(2), true) && (
        [cases.CAPITALIZED, cases.CAMEL].includes(determineCase(next)) || next.match(masculine.adjectivePattern)
      )
    );
    if (!plausibleFollowing) {
      return false;
    }
    const previous = chain.getPreviousToken();
    const plausiblePreceding = isPunctuation(previous, true) || previous.match(masculine.adjectivePattern);
    if (!plausiblePreceding) {
      return false;
    }
    return true;
  },
  replacement: "че",
  type: correctionTypes.UNCERTAIN,
  description: 'Відповідно до § 87 правопису, поряд із «повстанцю», «умільцю» можна вживати форму кличного відмінка '
    + '«повстанче», «умільче».'
}));