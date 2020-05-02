import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 54 правопису, назви сайтів «Google» і «Twitter» слід транслітерувати як «ґуґл» '
    + 'і «твітер».',
  rules: [{
    matches: ["(г)у(г)л*"],
    antiMatches: [
      ["гугл", ["ею", "я", "ям", "ями", "ях"]]
    ],
    // Other forms of "гугля" unfortunately coincide with the forms of "Гугл"
    replacement: "ґ"
  }, {
    matches: ["твіт(т)ер*"],
    replacement: ""
  }]
}));