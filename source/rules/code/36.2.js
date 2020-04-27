import {correctionTypes, registerWordRule, createTreeRule, unpackParadigm, combineCorrespondences} from "../imports.js";
import {doublyDeclined} from "../data/double-declension.js";

registerWordRule(createTreeRule(
  combineCorrespondences(doublyDeclined.map((pair) => unpackParadigm(
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