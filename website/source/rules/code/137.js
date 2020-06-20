import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["Ва(нзеє)", "Ва(ннзеє)", "Ва(ннзее)"],
  replacement: "нзее",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 137 правопису, німецьку назву «Ванзее» слід писати з одним «н» та двома «е».'
}));