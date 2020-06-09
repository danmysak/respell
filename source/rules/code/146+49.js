import {
  Correction,
  correctionTypes,
  registerWordRule,
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
      'Відповідно до § 146 та § 49 правопису, складова частина «ван» у таких іменах, як «ван Дейк» чи «ван дер ' +
        'Варден», пишеться окремо, а в утворених від них прикметниках, відповідно, разом.'
    );
  } else {
    let vanCase;
    if (determineLetterCase(van) === letterCases.UPPER) {
      vanCase = letterCases.UPPER;
    } else if (canBeSentenceBoundary(chain.getPreviousToken())) {
      vanCase = letterCases.CAPITALIZED;
    } else {
      vanCase = letterCases.LOWER;
    }
    const replacement = [
      setCase('ван', vanCase),
      makeLowerCaseIfNotUppercase(der).replace('-', ''),
      name
    ].filter((part) => part !== '').join(' ');
    return new Correction(type, replacement,
      'Відповідно до § 146 та § 49 правопису, складова частина «ван» у таких іменах, як «ван Дейк» чи «ван дер ' +
        'Варден», пишеться окремо та з малої літери (якщо з малої літери цю частину пишуть у мові оригіналу).'
    );
  }
});