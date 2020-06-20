import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: [[
    ["вагон", "комбайн", "ліжк", "літак", "людин", "машин", "пасажир", "сил", "тонн"],
    "о(-)",
    ["виліт", "вильот*", "годин*", "ден*", "дн*", "змін*", "кілометр*", "ліж*", "мил*", "місц*"]
  ]],
  replacement: "",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 36 правопису, слова «людинодень» і подібні (зі сполучним голосним) мають писатися '
    + 'разом.'
}));