import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule([{
  matches: ["правц(я)"],
  replacement: "ю",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 82 правопису, назва хвороби «правець» у родовому відмінку однини має форму «правцю».'
}, {
  matches: ["вігвам(а)"],
  replacement: "у",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 82 правопису, слово «вігвам» у родовому відмінку однини має форму «вігваму».'
}, {
  matches: ["придатк(а)"],
  replacement: "у",
  type: correctionTypes.UNCERTAIN,
  description: 'Відповідно до § 82 правопису, слово «придаток» у значенні доповнення має в родовому відмінку форму '
    + '«придатку».'
}, {
  matches: ["шлунк(а)"],
  replacement: "у",
  type: correctionTypes.UNCERTAIN,
  description: 'Відповідно до § 82 правопису, слово «шлунок» в абстрактному значенні потреби в їжі та у значенні '
    + 'страви з відповідного органа в родовому відмінку має форму «шлунку».'
}, {
  matches: [
    [["", "відео", "мікро", "радіо"], "телефон(у)"],
    [["відео", "домо", "смарт", "таксо", "шоломо"], "фон(у)"]
  ],
  replacement: "а",
  type: correctionTypes.UNCERTAIN,
  description: 'Відповідно до § 82 правопису, слово «телефон» у значенні пристрою (і за аналогією слова '
    + '«радіотелефон», «відеофон», «смартфон» і под.) в родовому відмінку має закінчення «-а».'
}]));