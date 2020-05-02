import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

const word = "хабар";
const replacements = {
  "а": ["я", ["", "м", "ми", "х"]],
  "е": ["ю"],
  "и": ["і"],
  "о": ["е", ["ві", "м"]],
  "у": ["ю"]
};

registerWordRule(createMaskRule({
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 67 правопису, слово «хабар» належить до м’якої групи.',
  rules: Object.entries(replacements).map(([letter, [replacement, endings]]) => ({
    matches: [[`*${word}(${letter})`, endings || [""]]],
    replacement
  }))
}));