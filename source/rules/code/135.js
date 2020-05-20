import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["Ш(и)рлі"],
  replacement: "е",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 135 правопису, ім’я або назву міста «Шерлі» слід писати через «е».'
}));