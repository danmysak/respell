import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["*про(е)кт*", "*про(е)кц*"],
  replacement: "є",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 126 правопису, слова «проєкт», «проєкція» та похідні від них слід писати з літерою «є».'
}));