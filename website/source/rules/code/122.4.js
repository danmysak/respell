import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["*(х)оспіс*"],
  replacement: "г",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 122 правопису, слово «госпіс» слід писати з літерою «г».'
}));