import {Correction, correctionTypes, registerWordRule, createMaskRule, normalizeCase} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["л(а)мберт*"],
  replacement: "е",
  type: correctionTypes.UNCERTAIN, // Can be French as well as English
  description: 'Відповідно до § 134 правопису, англійське «Lambert» слід передавати як «Лемберт».'
}));

registerWordRule((token) => {
  const replacement = token.replace(/^п[ае]лл?-м[ае]лл?/i, (match) => normalizeCase('пелл-мелл', match));
  return replacement.toLowerCase() === token.toLowerCase() ? null : new Correction(correctionTypes.MISTAKE, replacement,
    'Відповідно до § 134 правопису, назву вулиці в Лондоні слід писати як «Пелл-Мелл».');
});