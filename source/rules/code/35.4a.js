import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["багат(-)вечір*", "багат(-)вечор*"],
  replacement: "",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 35 правопису, слово «багатвечір» слід писати разом.'
}));