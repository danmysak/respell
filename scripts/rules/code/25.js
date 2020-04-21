import {
  correctionTypes,
  registerWordRule,
  createWordRule,
  canBeSentenceBoundary,
  getConsonants,
  getVowels,
  getSibilants
} from "../imports.js";

registerWordRule(createWordRule([{
  matches: ["(З)"],
  replacement: "Із",
  type: correctionTypes.MISTAKE,
  previousCallback: canBeSentenceBoundary,
  nextMatches: [
    [["з", "ц", "ч", "щ"], "*"]
  ],
  description: 'Відповідно до § 25 правопису, на початку речення перед літерами «з», «ц», «ч», «щ» замість '
    + 'прийменника «З» пишемо «Із» або (альтернативно і лише перед сполученням приголосних) «Зі».'
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