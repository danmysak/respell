import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["*солжен(і)цин*"],
  replacement: "и",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 144 правопису, прізвище «Солженицин» слід на загальних підставах писати через «-иц-».'
}));