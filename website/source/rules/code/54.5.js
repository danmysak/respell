import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["(с)оюз*"],
  antiMatches: ["Союз*"],
  previousMatches: ["Європейськ*"],
  replacement: "С",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 54 правопису, у назві «Європейський Союз» обидва слова пишуться з великої літери.'
}));