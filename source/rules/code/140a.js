import {correctionTypes, registerWordRule, createMaskRule, capitalize, parenthesizeFirst} from "../imports.js";

const components = ["стріт", "стрит", "сквер", "роуд", "ривер", "рівер", "лейн"];

registerWordRule(createMaskRule({
  rules: components.map((component) => ({
    matches: [`*-${parenthesizeFirst(capitalize(component))}*`],
    antiMatches: [`*-${component.toUpperCase()}*`],
    replacement: component[0]
  })),
  preserveReplacementCase: true,
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 140 правопису, компоненти назв «-стріт», «-сквер», «-роуд», «-ривер», «-лейн» слід '
    + 'писати з малої літери.'
}));

registerWordRule(createMaskRule({
  matches: ["*-р(і)вер*"],
  replacement: "и",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 140 правопису, компонент власних назв «-ривер» слід писати з літерою «и».'
}));