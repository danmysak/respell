import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  rules: [{
    matches: ["(Асканії-Нова)"],
    replacement: ["Асканії-Новій", "Асканії-Нової"]
  }, {
    matches: ["(Асканію-Нова)"],
    replacement: "Асканію-Нову"
  }, {
    matches: ["(Асканією-Нова)"],
    replacement: "Асканією-Новою"
  }, {
    matches: ["(Асканії-Нови)"],
    replacement: "Асканії-Нової"
  }, {
    matches: ["(Асканії-Нові)"],
    replacement: "Асканії-Новій"
  }, {
    matches: ["(Асканіє-Ново)"],
    replacement: "Асканіє-Нова"
  }],
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 152 правопису, у назві «Асканія-Нова» друга частина, як і перша, є відмінюваною, '
    + 'причому за зразком прикметника.'
}));