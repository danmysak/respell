import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["золото()валютн*"],
  replacement: "-",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 40 правопису, слово «золото-валютний» слід писати через дефіс.'
}));