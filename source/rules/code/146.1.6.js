import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  rules: [{
    previousMatches: ["Пак"],
    matches: [
      "(Тив)он*", "(Тів)он*", "(Чив)он*",
      "(Ти-в)он*", "(Ті-в)он*", "(Чи-в)он*", "(Чі-в)он*"
    ],
    replacement: "Чів",
  }, {
    previousMatches: ["Пак"],
    matches: ["(Ти)", "(Ті)", "(Чи)"],
    nextMatches: ["вон*"],
    replacement: "Чі"
  }, {
    callback: (token, chain) => (chain.getPreviousToken(2) || '').toLowerCase() === 'пак',
    previousMatches: ["Ти", "Ті", "Чи", "Чі"],
    matches: ["(в)он*"],
    antiMatches: ["ВОН*"],
    replacement: "в",
    preserveReplacementCase: true,
    removePreviousToken: true
  }],
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 146 правопису, ім’я корейського філософа слід писати як «Пак Чівон».'
}));