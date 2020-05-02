import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

const word = "пів";
const separators = ["-", "'", ""];

registerWordRule(createMaskRule({
  matches: separators.map((separator) => `${word}(${separator})*`),
  antiMatches: [
    [word, [
      ...separators, // So that the word by itself is not matched
      "тора*", "денн*", "нічн*", "річч*",
      "ень", "неві", "нем", "ням", "нями", "нях", "няч*", "нів", "нівс*", "ник*", "нич*",
      "онія*", "онію", "оніє*", "онії"
    ]]
  ],
  replacement: " ",
  type: correctionTypes.UNSURE,
  description: 'Відповідно до § 36 правопису, слово «пів» зі значенням «половина» з наступним іменником (у формі '
    + 'родового відмінка однини) слід писати окремо.'
}));