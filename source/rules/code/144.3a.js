import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: [
    [["*г", "*ґ", "*к", "*х"], "(є)єв*"]
  ],
  replacement: "е",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 144 правопису, російські прізвища на «-геев», «-кеев», «-хеев» слід передавати через '
    + '«-еєв».'
}));