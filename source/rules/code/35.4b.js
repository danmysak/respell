import {RuleApplication, correctionTypes, registerWordRule, cases, determineCase} from "../imports.js";

const prefixes = [
  "арт", "бліц", "веб", "віце", "економ", "екс", "кібер", "контр", "лейб", "максі", "міді", "міні",
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
  const postfixCase = determineCase(postfix);
  if (postfixCase === cases.EMPTY || postfixCase === cases.CAPITALIZED) {
    return null;
  }
  const correctionType = postfixCase === cases.LOWER ? correctionTypes.MISTAKE : correctionTypes.UNSURE;
  const replacement = token.slice(0, prefix.length) + postfix;
  return new RuleApplication(correctionType, replacement,
    'Відповідно до § 35 правопису, загальні назви з початковими компонентами «арт-», «бліц-», «веб-», «віце-», '
      + '«економ-», «екс-», «кібер-», «контр-», «лейб-», «максі-», «міді-», «міні-», «обер-», «поп-», «преміум-», '
      + '«прес-», «топ-», «унтер-», «флеш-», «фолк-»/«фольк-» та «штабс-» слід писати разом.'
  );
});