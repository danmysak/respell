import {
  Correction,
  correctionTypes,
  registerWordRule,
  createMaskRule,
  isCapitalized,
  getVowels,
  determineLetterCase,
  letterCases,
  getCompatibleNominalForms,
  nominalForms
} from "../imports.js";

const description = 'Відповідно до § 144 правопису, м’якість у польських прізвищах приголосних «n», «s», «c», «dz» '
  + 'перед іншими приголосними, зокрема й твердими, в українській мові м’яким знаком не позначається.';

registerWordRule(createMaskRule({
  matches: [
    "*н(ь)чик*",
    ["Ван(ь)кович", ["", "а", "еві", "ем", "і", "у"]]
    // Not to be confused with "Ваньковичі" and other settlement names ending in "ньковичі"
  ],
  callback: (token, chain) => {
    if (!isCapitalized(token)) {
      return false;
    }
    if (token === "Ваньковичі") {
      return getCompatibleNominalForms(chain).includes(nominalForms.LOCATIVE_SINGULAR);
    }
    return true;
  },
  replacement: "",
  type: correctionTypes.UNCERTAIN,
  description
}));

registerWordRule((token) => {
  const antiMatches = /(в[іо]сьм|мосьпан|^ницьма$|^ось(де|м)|письм|просьб|^тасьм|(ання|ати|іти|нути|нутися)$)/i;
  if (![letterCases.CAPITALIZED, letterCases.CAMEL].includes(determineLetterCase(token))
    || !token.includes('ь') || token.match(antiMatches)) {
    return null;
  }
  const letters = ["дз", "с", "ц"];
  const replacement = token.replace(new RegExp(
    `(${letters.join('|')})ь(?!(${['$', ...getVowels(true), "-", "й", `к(?!е(?!($|-)))`].join('|')}))`, 'gi'
  ), '$1'); // "к" very often follows "ь" in Ukrainian words, but the "ьке" case is of interest to us
  return replacement === token ? null : new Correction(correctionTypes.UNCERTAIN, replacement, description);
});