import {Correction, correctionTypes, createMaskRule, registerWordRule, normalizeCase} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["*фр(ейле)йн*", "*фр(ойле)йн*", "*фр(ейля)йн*"],
  replacement: "ойля",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 136 правопису, слово «фройляйн» слід писати з голосними «о» та «я».'
}));

registerWordRule((token) => {
  const replacement = token.replace(/(ві)тт?([гґ]еншт)[ае](йн)/i,
    (match, _1, _2, _3) => normalizeCase(`${_1}тт${_2}а${_3}`, match));
  return replacement.toLowerCase() === token.toLowerCase() ? null : new Correction(correctionTypes.MISTAKE, replacement,
    'Відповідно до § 136 правопису, німецьке прізвище «Віттгенштайн» слід писати з подвоєним «т» і літерою «а».');
});