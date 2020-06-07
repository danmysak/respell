import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  rules: [{
    matches: ["Єф(и)мов*"],
    replacement: "і",
  }, {
    matches: ["Зв(ерє)в*", "Зв(єрє)в*", "Зв(ере)в*"],
    replacement: "єре",
  }, {
    matches: ["Дягил(е)в*"],
    replacement: "є",
  }, {
    matches: ["Зябр(є)в*"],
    replacement: "е",
  }],
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 144 правопису, на загальних підставах російське прізвище «Ефимов» слід передавати як '
    + '«Єфімов», «Зверев» — як «Звєрев», «Дягилев» — як «Дягилєв», «Зябрев» — як «Зябрев».'
}));