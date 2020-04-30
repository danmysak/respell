import {
  correctionTypes,
  registerWordRule,
  createTreeRule,
  combineCorrespondences,
  capitalize,
  canBeSentenceBoundary,
  determineCase,
  cases
} from "../imports.js";
import {greekLetters} from "../data/greek-letters.js";

registerWordRule(createTreeRule(
  combineCorrespondences(
    greekLetters.flatMap((group) => group.roots.map((root) => [root, group.paradigm])).map(
      ([root, paradigm]) => Object.fromEntries(paradigm.map((suffix) => [capitalize(root + suffix), root + suffix]))
    )
  ),
  correctionTypes.UNSURE,
  'Відповідно до § 51 правопису, порядкові позначення яскравості зірок (назви грецьких літер) слід писати з малої '
    + 'букви.',
  {
    callback: (token, chain) => !(
      canBeSentenceBoundary(chain.getPreviousToken())
      || chain.getNextToken() === null
      || determineCase(chain.getNextToken()) === cases.LOWER
    ),
    fixApostrophe: true
  })
);