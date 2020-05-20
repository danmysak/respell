import {Correction, correctionTypes, registerWordRule, normalizeCase} from "../imports.js";

registerWordRule((token) => {
  const replacement = token.replace(/(ві)тт?([гґ]еншт)[ае](йн)/i,
    (match, _1, _2, _3) => normalizeCase(`${_1}тт${_2}а${_3}`, match));
  return replacement.toLowerCase() === token.toLowerCase() ? null : new Correction(correctionTypes.MISTAKE, replacement,
    'Відповідно до § 136 правопису, німецьке прізвище «Віттгенштайн» слід писати з подвоєним «т» і літерою «а».');
});