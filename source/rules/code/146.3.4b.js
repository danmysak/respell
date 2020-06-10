import {correctionTypes, registerWordRule, labels, createMaskRule, getFirstLetter, isCapitalized} from "../imports.js";

registerWordRule(createMaskRule({
  callback: (token) => isCapitalized(getFirstLetter(token)),
  matches: [
    ["+(-паш)", ["а", "ам", "ами", "ах", "е", "ею", "і", "ів", "у"]]
  ],
  replacement: "паш", // This way "-Паш" will be replaced into "паш", but "-ПАШ" will remain "ПАШ"
  preserveReplacementCase: true,
  type: correctionTypes.UNCERTAIN,
  description: 'Відповідно до § 146 правопису, східні прізвища (але не імена) з кінцевим компонентом «паша» слід ' +
    'писати без дефіса.'
}), [labels.FOREIGN_NAMES]);