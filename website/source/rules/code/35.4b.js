import {Correction, correctionTypes, registerWordRule, letterCases, determineLetterCase} from "../imports.js";

const prefixes = [
  "арт", "бліц", "веб", "віце", "диско", "економ", "екс", "кібер", "контр", "лейб", "максі", "медіа", "міді", "міні",
  "обер", "поп", "преміум", "прес", "топ", "унтер", "флеш", "фолк", "фольк", "штабс"
];

const hyphen = '-';

registerWordRule((token) => {
  const lowerCased = token.toLowerCase();
  const prefix = prefixes.find((prefix) => lowerCased.startsWith(`${prefix}${hyphen}`));
  if (!prefix) {
    return null;
  }
  const postfix = token.slice(prefix.length + hyphen.length);
  const postfixCase = determineLetterCase(postfix);
  if ([letterCases.EMPTY, letterCases.CAPITALIZED, letterCases.CAMEL].includes(postfixCase)) {
    return null;
  }
  const correctionType = postfixCase === letterCases.LOWER ? correctionTypes.MISTAKE : correctionTypes.UNCERTAIN;
  const replacement = token.slice(0, prefix.length) + postfix;
  return new Correction(correctionType, replacement,
    'Відповідно до § 35 правопису, загальні назви з початковими компонентами «арт-», «бліц-», «веб-», «віце-», '
      + '«диско-», «економ-», «екс-», «кібер-», «контр-», «лейб-», «максі-», «медіа-», «міді-», «міні-», «обер-», '
      + '«поп-», «преміум-», «прес-», «топ-», «унтер-», «флеш-», «фолк-»/«фольк-» та «штабс-» слід писати разом.'
  );
});