import {
  correctionTypes,
  registerWordRule,
  createTreeRule,
  unpackDoubleParadigm,
  combineCorrespondences
} from "../imports.js";
import {doublyDeclined} from "../data/doubly-declined.js";

registerWordRule(createTreeRule(
  combineCorrespondences(doublyDeclined.map((pair) => unpackDoubleParadigm(
    pair.paradigm, `${pair.before}${pair.beforeSuffix}-${pair.after}`,
    pair.before, (form, afterEnding) => `${form}-${pair.after}${afterEnding}`
  ))),
  correctionTypes.MISTAKE,
  'Відповідно до § 36 правопису, у словах «член-кореспондент» та «брат-і-сестра» відмінюються обидва складові '
    + 'іменники, а не лише другий.',
  {
    lowerCase: true,
    fixApostrophe: true
  })
);