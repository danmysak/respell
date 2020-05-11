import {correctionTypes, registerWordRule, createMaskRule, getVowels} from "../imports.js";

const previousPattern = new RegExp(`(([${[...getVowels(true), 'ь', '\'', '’'].join('')}]|^)[яюєї]|й)$`, 'i');

registerWordRule(createMaskRule({
  matches: ["(й)"],
  replacement: "і",
  alternatives: ["та"],
  type: correctionTypes.MISTAKE,
  previousCallback: (token) => token.match(previousPattern),
  description: 'Відповідно до § 24 правопису, після слова, що закінчується на «й», «я», «ю», «є», «ї», слід вживати '
    + 'сполучники «і» або «та».'
}));