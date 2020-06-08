import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["Їрж(и)"],
  replacement: "і",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 144 правопису, ім’я «Їржі» пишеться з «і» в кінці.'
}));