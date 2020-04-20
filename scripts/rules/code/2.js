import {correctionTypes, registerWordRule, createWordRule, parenthesizeFirst} from "../imports.js";

registerWordRule(createWordRule({
  replacement: "и",
  rules: [{
    matches: parenthesizeFirst(["іч", "ірій", "ірію", "ірієві", "ірієм", "ірії", "ірод*"]),
    type: correctionTypes.IMPROVEMENT,
    description: 'Відповідно до § 2 правопису, слова «ірій», «ірод», «іч» та похідні від них можна писати через «и».'
  }, {
    matches: parenthesizeFirst(["Ін*"]),
    previousMatches: ["Чен"],
    type: correctionTypes.MISTAKE,
    description: 'Відповідно до § 2 правопису, останню частину імені Кім Чен Ина слід писати через «И».'
  }]
}));