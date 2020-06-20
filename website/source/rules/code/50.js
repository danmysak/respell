import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["(н)ародів"],
  antiMatches: ["Народів"],
  previousMatches: ["Дружби"],
  replacement: "Н",
  description: 'Відповідно до поданих у § 50 правопису прикладів, з великої літери слід писати всі слова у назвах '
    + 'вулиць, площ і т. д., крім родових назв; зокрема, правильним у цьому контексті є написання «Дружби Народів».',
  rules: [{
    callback: (token, chain) => [2, 3, 4] // 2: проспект Дружби народів; 4: ст. м. «Дружби народів»
      .some((level) => (chain.getPreviousToken(level) || '').match(/^(просп|проспект.*|вул|вулиц.*|м|метро)$/i)),
    type: correctionTypes.MISTAKE
  }, {
    type: correctionTypes.UNCERTAIN
  }]
}));