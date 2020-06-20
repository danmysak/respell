import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["мар(е)в*"],
  replacement: "и",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 32 правопису, слово «мариво» (і, як наслідок, похідні від нього) слід писати через «и».'
}));