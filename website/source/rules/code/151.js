import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["в(')ятк*", "в(')ятц*"],
  replacement: "",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 151 правопису, на загальних підставах назву «Вятка» слід писати без апострофа.'
}));