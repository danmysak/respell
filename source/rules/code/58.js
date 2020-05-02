import {
  registerWordRule,
  correctionTypes,
  createTreeRule,
  unpackSingleParadigmList,
  capitalize,
  isQuote,
  isAfterSentenceBoundary
} from "../imports.js";
import {brands} from "../data/brands.js";

registerWordRule(createTreeRule(
  unpackSingleParadigmList(brands, (form) => [form, form]), correctionTypes.UNSURE,
  'Відповідно до § 58 правопису, назви індивідуальних машин, літаків та інших виробів — на противагу їхнім маркам або '
    + 'назвам компаній-виробників — слід писати з малої літери (і в лапках).',
  {
    callback: (token, chain) => isQuote(chain.getPreviousToken(1, false)) && isQuote(chain.getNextToken(1, false)),
    mapper: (token, chain) => isAfterSentenceBoundary(chain) ? capitalize(token) : token.toLowerCase(),
    // We do it like this so that "Ролс-Ройс" can become "Ролс-ройс" at the beginning of a sentence
    fixApostrophe: true
  })
);