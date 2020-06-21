import {
  correctionTypes,
  registerWordRule,
  createMaskRule,
  canBeSentenceBoundary,
  getConsonants,
  getVowels,
  getSibilants
} from "../imports.js";

registerWordRule(createMaskRule([{
  matches: ["(З)"],
  type: correctionTypes.MISTAKE,
  previousCallback: canBeSentenceBoundary,
  canBeFirst: true,
  rules: [{
    replacement: ["Із"],
    nextMatches: [
      [["з", "ц", "ч"], "*"]
    ],
  }, {
    replacement: ["Зі", "Із"],
    nextMatches: [
      [["щ"], "*"]
    ],
  }],
  description: 'Відповідно до § 25 правопису, на початку речення перед літерами «з», «ц», «ч», «щ» замість '
    + 'прийменника «З» пишемо «Із» або (альтернативно і лише перед сполученням приголосних звуків) «Зі».'
}, {
  matches: ["(із)"],
  replacement: "з",
  type: correctionTypes.MISTAKE,
  previousMatches: [
    ["*", getSibilants(true)]
  ],
  previousCallback: (token) => {
    const normalized = token.toLowerCase().replace(/ь$/, '');
    return normalized.length < 2 || !getConsonants(true).includes(normalized[normalized.length - 2].toLowerCase())
  },
  nextMatches: [
    [getVowels(false), "*"]
  ],
  description: 'Відповідно до § 25 правопису, після свистячих та шиплячих (що не входять у сполучення приголосних) '
    + 'перед голосним замість «із» слід писати «з».'
}]));