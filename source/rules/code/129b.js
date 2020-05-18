import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["*-стр(и)т*"],
  replacement: "і",
  type: correctionTypes.MISTAKE,
  description: 'Відподвідно до § 129 правопису, у компоненті власних назв «-стріт» слід писати «і».'
}));

registerWordRule(createMaskRule({
  matches: ["р(і)джент*"],
  replacement: "и",
  type: correctionTypes.MISTAKE,
  description: 'Відподвідно до § 129 правопису, слово «Риджент» (як, наприклад, у складі «Риджент-стріт») слід писати '
    + 'з літерою «и».'
}));

registerWordRule(createMaskRule({
  matches: [
    ["мед(і)н", ["а", "и", "і", "о", "ою", "у", "івськ*"]]
  ],
  replacement: "и",
  type: correctionTypes.MISTAKE,
  description: 'Відподвідно до § 129 правопису, назву «Медина» слід писати через «и».'
}));

registerWordRule(createMaskRule({
  matches: ["біарр(і)ц*"],
  replacement: "и",
  type: correctionTypes.MISTAKE,
  description: 'Відподвідно до § 129 правопису, назву «Біарриц» слід писати через «и» в останньому складі.'
}));

registerWordRule(createMaskRule({
  matches: ["р(и)чард*"],
  replacement: "і",
  type: correctionTypes.MISTAKE,
  description: 'Відподвідно до § 129 правопису, ім’я «Річард» слід писати через «і».'
}));

registerWordRule(createMaskRule({
  matches: ["(у)олл*"],
  replacement: "в",
  type: correctionTypes.MISTAKE,
  description: 'Відподвідно до § 129 правопису, компонент «Волл» (як, наприклад, у складі «Волл-стріт») слід писати '
    + 'з літерою «В».'
}));