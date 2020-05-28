import {
  Correction,
  correctionTypes,
  registerWordRule,
  createTreeRule,
  unpackDoubleParadigm,
  arrayify,
  normalizeCase
} from "../imports.js";

const lastName = "дойл";
const middleName = "конан";
const endings = {
  "еві": "ові",
  "ем": "ом",
  "і": "и",
  "ів": "ів", // This is needed for the middle name rule
  "ь": "",
  "ю": ["у", "е"],
  "я": "а",
  "ям": "ам",
  "ями": "ами",
  "ях": "ах"
};

registerWordRule(createTreeRule(
  unpackDoubleParadigm(endings, lastName),
  correctionTypes.MISTAKE, 'Відповідно до § 140 правопису, прізвище «Дойл» не містить м’якого знака в кінці.',
  {
    lowerCase: true,
    fixApostrophe: true
  })
);

registerWordRule((token, chain) => {
  if (token.toLowerCase() !== middleName) {
    return null;
  }
  const next = (chain.getNextToken() || '').toLowerCase();
  if (!next.startsWith(lastName)) {
    return null;
  }
  const ending = next.slice(lastName.length);
  let middleNameEndings;
  if (endings.hasOwnProperty(ending)) {
    if (endings[ending] === '') {
      return null;
    }
    middleNameEndings = endings[ending];
  } else if (ending !== '' && Object.values(endings).flat().includes(ending)) {
    middleNameEndings = ending;
  } else {
    return null;
  }
  const replacements = arrayify(middleNameEndings).map((ending) => normalizeCase(middleName + ending, token));
  return new Correction(correctionTypes.MISTAKE, replacements,
    'Відповідно до § 140 правопису, у прізвищі Конана Дойла відмінюються обидві частини.'
  );
});