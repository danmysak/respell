import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["тат()"],
  antiMatches: ["ТАТ"],
  replacement: "ів",
  type: correctionTypes.UNCERTAIN, // There is also a homonymic nationality
  description: 'Відповідно до § 89 правопису, форма родового відмінка множини від слова «тато» — «татів» (з можливими '
    + 'наголосами на обох складах).'
}));