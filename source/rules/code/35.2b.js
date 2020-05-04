import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

const socialSuffixes = ["знавств*", "твор*", "твір*"];
const medicalSuffixes = ["терап*", "препарат*"];

const parts = {
  "артері(о)": ["венозн*"],
  "бактері(о)": ["вловлюва*", "носі*"],
  "історі(о)": socialSuffixes,
  "наці(о)": socialSuffixes,
  "хімі(о)": medicalSuffixes,
  "фотохімі(о)": medicalSuffixes
};

registerWordRule(createMaskRule({
  replacement: "є",
  description: '§ 35 правопису підкреслює можливість сполучати основи іншомовного походження на «-ія» через сполучний '
    + '«-є-» у разі, коли отримане складне слово дійсно можна тлумачити як сполучення двох повноцінних основ (на '
    + 'противагу одному слову, запозиченому цілком).',
  rules: [{
    matches: Object.entries(parts),
    type: correctionTypes.IMPROVEMENT
  }, {
    matches: Object.keys(parts).map((key) => [key, ["-"]]),
    type: correctionTypes.UNCERTAIN
  }]
}));