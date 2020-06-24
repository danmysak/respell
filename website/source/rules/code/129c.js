import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["(у)олл*"],
  replacement: "в",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 129 правопису, компонент «Волл» (як, наприклад, у складі «Волл-стріт») слід писати '
    + 'з літерою «В».'
}));