import {correctionTypes, registerWordRule, createMaskRule, isPunctuation, determineCase, cases} from "../imports.js";
import {masculine} from "../data/vocative.js";

registerWordRule(createMaskRule({
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
  type: correctionTypes.UNCERTAIN,
  rules: [{
    matches: [
      [["повстан", "уміль"], "(цю)"]
    ],
    replacement: "че",
    description: 'Відповідно до § 87 правопису, поряд із «повстанцю», «умільцю» можна вживати форму кличного відмінка '
      + '«повстанче», «умільче».'
  }, {
    matches: [
      [["сер", "сір", "гер"], "(е)"]
    ],
    replacement: "",
    description: 'Відповідно до § 87 правопису, форма кличного відмінка слів «сер», «сір», «гер» збігається з формою '
      + 'називного відмінка.'
  }]
}));