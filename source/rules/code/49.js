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

const chiwonPrefixes = ["Ч|і", "Ч|хі", "Ч|и", "Ч|хи", "Ч|хви"];

registerWordRule(createMaskRule({
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 49 правопису, ім’я корейського діяча слід писати як «Чхве Чхвівон».',
  rules: [{
    matches: ["Ч(о)", "Ч(е)", "Ч(хо)", "Ч(хе)", "Ч(хво)"],
    nextMatches: ["Чі*", "Чх*"],
    replacement: "хве"
  }, {
    matches: chiwonPrefixes.map((prefix) => prefix.replace('|', '(') + ')'),
    nextMatches: ["вон*"],
    replacement: "хві"
  }, {
    matches: chiwonPrefixes.flatMap((prefix) => [
      `${prefix.replace('|', '(')}в)он*`,
      `${prefix.replace('|', '(')}-в)он*`
    ]),
    replacement: "хвів"
  }]
}));

registerWordRule(createMaskRule({
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 49 правопису, складові корейських імен «Вансо», «Чхвівон», «Гімун» слід писати разом.',
  preserveReplacementCase: true,
  rules: [{
    removePreviousToken: true,
    rules: [{
      previousMatches: ["Ван"],
      matches: ["(с)о"],
      replacement: "с"
    }, {
      previousMatches: ["Чхві", "Чхі", "Чі"],
      matches: ["(в)он*"],
      replacement: "в"
    }, {
      previousMatches: ["Гі"],
      matches: ["(м)ун*"],
      replacement: "м"
    }]
  }, {
    rules: [{
      matches: ["Ван(-с)о"],
      replacement: "с"
    }, {
      matches: ["Чхві(-в)он*"],
      replacement: "в"
    }, {
      matches: ["Гі(-м)ун*"],
      replacement: "м"
    }]
  }]
}));

registerWordRule(createMaskRule({
  matches: ["р(и)чард*"],
  replacement: "і",
  type: correctionTypes.MISTAKE,
  description: 'Як продемонстровано у § 49 правопису, ім’я «Річард» слід писати через «і».'
}));