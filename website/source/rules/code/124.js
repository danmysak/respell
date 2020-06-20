import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["*(уі)кенд*", "*(уї)кенд*"],
  replacement: "ві",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 124 правопису, слово «вікенд» слід писати через «в».'
}));