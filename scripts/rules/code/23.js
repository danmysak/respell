import {correctionTypes, registerWordRule, createWordRule} from "../imports.js";

registerWordRule(createWordRule({
  matches: ["(у)"],
  replacement: "в",
  type: correctionTypes.MISTAKE,
  rules: [{
    previousMatches: [
      ["*", ["б", "в", "г", "ґ", "д", "ж", "з", "й", "к", "л", "м", "н",
             "п", "р", "с", "т", "ф", "х", "ц", "ч", "ш", "щ", "ь"]]
    ],
    nextMatches: [
      [["а", "е", "є", "и", "і", "о", "у"], "*"]
    ],
    description: 'Відповідно до § 23 правопису, після слова, що завершується на приголосний, перед словом, ' +
      'що починається на голосний, ставимо «в».'
  }, {
    nextCallback: (token) => token.match(/^[АЕИІЛМНОРСУФ][А-ЯҐЄІЇ]+$/),
    description: 'Відповідно до § 23 правопису, перед абревіатурою, у назві першої букви якої вимовляють голосний, ' +
      'слід ставити прийменник «в».'
  }]
}));