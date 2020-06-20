import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["фр(и)др(и)х*", "фр(и)др(і)х*", "фр(і)др(и)х*"],
  replacement: "і",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 146 правопису, ім’я «Фрідріх» слід писати з двома літерами «і».'
}));