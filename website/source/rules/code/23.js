import {correctionTypes, registerWordRule, createMaskRule, getConsonants, getVowels} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["(у)"],
  replacement: "в",
  type: correctionTypes.MISTAKE,
  rules: [{
    previousMatches: [
      ["*", getConsonants(true)]
    ],
    nextMatches: [
      [getVowels(false), "*"]
    ],
    description: 'Відповідно до § 23 правопису, після слова, що завершується на приголосний, перед словом, '
      + 'що починається на голосний, ставимо «в».'
  }, {
    nextCallback: (token) => token.match(new RegExp(`^[АЕИІЛМНОРСУФ][${getConsonants(false).join('').toUpperCase()}]`))
      && !["США"].includes(token),
    description: 'Відповідно до § 23 правопису, перед абревіатурою, у назві першої букви якої вимовляють голосний, '
      + 'слід ставити прийменник «в».'
  }]
}));