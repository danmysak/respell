import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["Дона(х)'ю"],
  replacement: "г",
  type: correctionTypes.MISTAKE,
  description: 'Як продемонстровано в § 138 правопису, прізвище «Донаг’ю» слід писати з літерою «г».'
}));