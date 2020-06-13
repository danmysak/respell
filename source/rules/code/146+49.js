import {
  Correction,
  correctionTypes,
  registerWordRule,
  createMaskRule,
  canBeSentenceBoundary,
  setCase,
  makeLowerCaseIfNotUppercase,
  determineLetterCase,
  letterCases
} from "../imports.js";

registerWordRule((token, chain) => {
  const match = token.match(/^(ван-)(?!гог)(дер-)?([^-]+)$/i); // "Ван Гог" is handled by a separate rule
  if (!match) {
    return null;
  }
  const van = match[1];
  const der = match[2] || '';
  const name = match[3];
  const type = der === '' ? correctionTypes.UNCERTAIN : correctionTypes.MISTAKE;
  const adjective = name.match(/[ії]вськ/i);
  if (adjective) {
    const replacement = (van + makeLowerCaseIfNotUppercase(der) + makeLowerCaseIfNotUppercase(name)).replace(/-/g, '');
    return new Correction(type, replacement,
      'Відповідно до § 146 та § 49 правопису, складова частина «ван» у таких іменах, як «ван Дейк» чи «ван дер '
        + 'Варден», пишеться окремо, а в утворених від них прикметниках, відповідно, разом.'
    );
  } else {
    let vanCases = [];
    if (determineLetterCase(van) === letterCases.UPPER) {
      vanCases.push(letterCases.UPPER);
    } else if (canBeSentenceBoundary(chain.getPreviousToken())) {
      vanCases.push(letterCases.CAPITALIZED);
    } else {
      vanCases.push(letterCases.LOWER, letterCases.CAPITALIZED);
    }
    const replacements = vanCases.map((vanCase) => [
      setCase('ван', vanCase),
      makeLowerCaseIfNotUppercase(der).replace('-', ''),
      name
    ].filter((part) => part !== '').join(' '));
    return new Correction(type, replacements,
      'Відповідно до § 146 та § 49 правопису, складова частина «ван» у таких іменах, як «ван Дейк» чи «ван дер '
        + 'Варден», пишеться окремо та з малої літери (якщо з малої літери цю частину пишуть у мові оригіналу).'
    );
  }
});

registerWordRule(createMaskRule({
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 49 та § 146 правопису, складові корейських імен «Вансо», «Чівон», «Чхвівон», «Гімун» '
    + 'слід писати разом.',
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
      previousMatches: ["Гі", "Ґі"],
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
      matches: ["Гі(-м)ун*", "Ґі(-м)ун*"],
      replacement: "м"
    }]
  }]
}));