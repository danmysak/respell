import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: [
    [["", "*-", "не"], "ді(е)з*"]
  ],
  replacement: "є",
  type: correctionTypes.MISTAKE,
  description: 'Відподвідно до § 130 правопису, слово «дієз» (та похідні) слід писати з літерою «є».'
}));

registerWordRule(createMaskRule({
  matches: ["рі(елто)р*", "рі(елте)р*", "рі(єлте)р*"],
  replacement: "єлто",
  type: correctionTypes.MISTAKE,
  description: 'Відподвідно до § 130 правопису, слово «рієлтор» пишеться з літерами «є» та «о».'
}));

registerWordRule(createMaskRule({
  matches: ["арі(е)л*", "дані(е)л*"],
  replacement: "є",
  type: correctionTypes.MISTAKE,
  description: 'Відподвідно до § 130 правопису, імена «Арієль» та «Данієль» пишуться з літерою «є».'
}));