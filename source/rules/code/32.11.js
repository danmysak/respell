import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["Ігор(о)вич*", "Ігор(е)вич*"],
  replacement: "ьо",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 32 правопису, правильне написання по батькові від імені «Ігор» — «Ігорьович».'
}));