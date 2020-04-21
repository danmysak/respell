import {correctionTypes, registerWordRule, createWordRule} from "../imports.js";

registerWordRule(createWordRule({
  matches: ["свяще(н)и*"],
  replacement: "нн",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 29 правопису, слово «священник» (і, як наслідок, похідні від нього) слід писати '
    + 'з подвоєнням «н».'
}));