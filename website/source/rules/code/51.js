import {
  correctionTypes,
  registerWordRule,
  createTreeRule,
  unpackSingleParadigmList,
  capitalize,
  canBeSentenceBoundary,
  determineLetterCase,
  letterCases
} from "../imports.js";
import {greekLetters} from "../../data/greek-letters.js";

registerWordRule(createTreeRule(
  unpackSingleParadigmList(greekLetters, (form) => [capitalize(form), form]),
  correctionTypes.UNCERTAIN,
  'Відповідно до § 51 правопису, порядкові позначення яскравості зірок (назви грецьких літер) слід писати з малої '
    + 'букви.',
  {
    callback: (token, chain) => !(
      canBeSentenceBoundary(chain.getPreviousToken())
      || chain.getNextToken() === null
      || determineLetterCase(chain.getNextToken()) === letterCases.LOWER
    ),
    fixApostrophe: true
  })
);