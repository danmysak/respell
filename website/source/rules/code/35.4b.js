import {Correction, correctionTypes, registerWordRule, letterCases, determineLetterCase} from "../imports.js";

const top = "топ";
const topGeneralReplacements = ["найкращих", "найпопулярніших", "основних"];
const topSingularReplacements = ["найкращий", "найкраща", "найкраще"];

const prefixes = [
  "арт", "бліц", "веб", "віце", "диско", "економ", "екс", "кібер", "контр", "лейб", "максі", "медіа", "міді", "міні",
  "обер", "поп", "преміум", "прес", top, "унтер", "флеш", "фолк", "фольк", "штабс"
];

const hyphen = '-';

function processTopWithNumber(postfix) {
  if (!postfix.match(/^\d+$/)) {
    return null;
  }
  const lastTwo = (+postfix) % 100;
  const last = lastTwo % 10;
  let options, requiresExtraChange;
  if ((lastTwo > 10 && lastTwo < 20) || last === 0 || last >= 5) {
    options = topGeneralReplacements;
    requiresExtraChange = false;
  } else {
    options = last === 1 ? topSingularReplacements : topGeneralReplacements;
    requiresExtraChange = true;
  }
  return new Correction(correctionTypes.MISTAKE, options.map((option) => `${postfix} ${option}`),
    'Відповідно до § 35 правопису, компонент «топ-» не можна поєднувати з числівниками.',
    {requiresExtraChange}
  );
}

registerWordRule((token) => {
  const lowerCased = token.toLowerCase();
  const prefix = prefixes.find((prefix) => lowerCased.startsWith(`${prefix}${hyphen}`));
  if (!prefix) {
    return null;
  }
  const postfix = token.slice(prefix.length + hyphen.length);
  if (postfix.match(/^\d/)) {
    if (prefix === top) {
      return processTopWithNumber(postfix);
    } else {
      return null;
    }
  }
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