import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

const socialSuffixes = ["знавств*", "твор*", "твір*"];
const medicalSuffixes = ["терап*", "препарат*"];

registerWordRule(createMaskRule({
  matches: [
    "артері(о)венозн*", "бактері(о)вловлюва*", "бактері(о)носі*",
    ["історі(о)", socialSuffixes], ["наці(о)", socialSuffixes],
    ["хімі(о)", medicalSuffixes], ["фотохімі(о)", medicalSuffixes]
  ],
  replacement: "є",
  type: correctionTypes.IMPROVEMENT,
  description: '§ 35 правопису підкреслює можливість сполучати основи іншомовного походження на «-ія» через сполучний '
    + '«-є-» у разі, коли отримане складне слово дійсно можна тлумачити як сполучення двох повноцінних основ (на '
    + 'противагу одному слову, запозиченому цілком).'
}));