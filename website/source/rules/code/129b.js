import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule([{
  matches: ["*-стр(и)т*"],
  replacement: "і",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 129 правопису, у компоненті власних назв «-стріт» слід писати «і».'
}, {
  matches: ["р(і)джент*"],
  replacement: "и",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 129 правопису, слово «Риджент» (як, наприклад, у складі «Риджент-стріт») слід писати '
    + 'з літерою «и».'
}, {
  matches: [
    ["мед(і)н", ["а", "и", "і", "о", "ою", "у", "івськ*"]]
  ],
  replacement: "и",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 129 правопису, назву «Медина» слід писати через «и».'
}, {
  matches: ["біарр(і)ц*"],
  replacement: "и",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 129 правопису, назву «Біарриц» слід писати через «и» в останньому складі.'
}, {
  matches: ["р(и)чард*"],
  replacement: "і",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 129 правопису, ім’я «Річард» слід писати через «і».'
}]));