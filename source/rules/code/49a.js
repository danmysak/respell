import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule([{
  matches: ["(в)ан"],
  antiMatches: ["Ван"],
  nextMatches: ["Гог*"],
  replacement: "В",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 49 правопису, обидві частини імені Ван Гога слід писати з великої літери.'
}, {
  matches: ["ва(н-г)огівськ*"], // The selection is so that "Ван-Гогівський" doesn't become "ВанГогівський"
  replacement: "нг",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 49 правопису, ім’я Ван Гога слід писати двома окремими словами, а прикметники, '
    + 'утворені від цього імені, відповідно, разом.'
}, {
  matches: ["Ван(-г)ог*"],
  replacement: " Г",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 49 правопису, ім’я Ван Гога слід писати двома окремими словами, обидва з великої букви.'
}]));

registerWordRule(createMaskRule({
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 49 правопису, ім’я корейського діяча слід писати як «Чхве Чхвівон».',
  rules: [{
    matches: ["Ч(о)", "Ч(е)", "Ч(хо)", "Ч(хе)", "Ч(хво)"],
    nextMatches: ["Чі*", "Чх*"],
    replacement: "хве"
  }, {
    rules: [{
      matches: ["Ч(хі)", "Ч(хи)", "Ч(хви)"],
    }, {
      previousMatches: ["Чо", "Че", "Чхо", "Чхе", "Чхво", "Чхве"],
      matches: ["Ч(і)", "Ч(и)"]
    }],
    nextMatches: ["вон*"],
    replacement: "хві"
  }, {
    rules: [{
      matches: ["Ч(хів)он*", "Ч(хі-в)он*", "Ч(хив)он*", "Ч(хи-в)он*", "Ч(хвив)он*", "Ч(хви-в)он*"],
    }, {
      previousMatches: ["Чо", "Че", "Чхо", "Чхе", "Чхво", "Чхве"],
      matches: ["Ч(ів)он*", "Ч(і-в)он*", "Ч(ив)он*", "Ч(и-в)он*"]
    }],
    replacement: "хвів"
  }]
}));