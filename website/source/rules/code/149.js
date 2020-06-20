import {correctionTypes, registerWordRule, createMaskRule, isCapitalized} from "../imports.js";

const minLength = 6;

const vowelReplacements = ["иці", "иць", "ицям", "ицями", "ицях"];
const consonantReplacements = ["ці", "ець", "цям", "цями", "цях"];
const softReplacements = ["ьці", "ець", "ьцям", "ьцями", "ьцях"];

registerWordRule(createMaskRule({
  callback: (token) => isCapitalized(token) && token.length >= minLength,
  rules: [{
    matches: ["*(ице)"],
    antiMatches: [
      [["", "без", "*о"], "лице"]
    ],
    type: correctionTypes.UNCERTAIN,
    replacement: vowelReplacements
  }, {
    matches: ["*(іце)"],
    antiMatches: [
      "бліце",
      "Гурвіце",
      "Лейбніце", "Ляйбніце",
      "Штірліце"
    ],
    type: correctionTypes.MISTAKE,
    replacement: vowelReplacements
  }, {
    matches: ["*в(це)"],
    antiMatches: [
      "*вбивце", "*убивце",
      "вівце",
      "деревце", "древце",
      "маревце", "маривце",
      "мереживце",
      "*пивце", // "кровопивце"
      "*слівце",
      "черевце"
    ],
    type: correctionTypes.MISTAKE,
    replacement: consonantReplacements
  }, {
    matches: ["*н(це)"],
    antiMatches: [
      "Баренце",
      "борошенце",
      "веретенце",
      "винце",
      "віконце",
      "вінце",
      "волоконце",
      "денце",
      "зеренце",
      "колінце",
      "*принце",
      "полінце",
      "пшонце",
      "сінце",
      "*сонце",
      "стегенце",
      "стремінце",
      "суденце",
      "Франце",
      "човенце"
    ],
    type: correctionTypes.MISTAKE,
    replacement: consonantReplacements
  }, {
    matches: ["*р(це)"],
    antiMatches: [
      "відерце",
      "люстерце",
      "озерце",
      "перце",
      "реберце",
      "*серце",
      "цеберце",
      "ядерце"
    ],
    type: correctionTypes.MISTAKE,
    replacement: consonantReplacements
  }, {
    matches: [
      "Кел(ьце)",
      "Седл(ьце)"
    ],
    type: correctionTypes.MISTAKE,
    replacement: softReplacements
  }],
  description: 'Відповідно до § 149 правопису, польські, чеські та словацькі географічні назви, що в мові оригіналу '
    + 'закінчуються на «-ce» та виражають значення множини, в українській мові слід передавати з кінцівкою «-ці» '
    + '(а «-ice» — як «-иці») та відмінювати як іменники у множині.'
}));