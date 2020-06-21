import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";
import {halfExceptions} from "../../data/half-exceptions.js";

const prefix = "пів";
const minRootLength = 3;
const separators = ["-", "'", ""];

registerWordRule(createMaskRule({
  callback: (token) => {
    if (token.length < prefix.length + minRootLength) {
      return false;
    }
    const lowerCased = token.toLowerCase();
    return lowerCased.startsWith(prefix) && !halfExceptions.includes(lowerCased.slice(prefix.length));
  },
  matches: separators.map((separator) => `${prefix}(${separator})*`),
  antiMatches: [ // As opposed to halfExceptions, here are listed words that don't exist without "пів"
    [prefix, [
      ...separators, // So that the prefix by itself is not matched
      "тора*", "тори", "денн*", "нічн*", "річч*",
      "ень", "неві", "нем", "ням", "нями", "нях", "няч*", "нів", "нівс*", "ник*", "нич*",
      "онія*", "онію", "оніє*", "онії"
    ]]
  ],
  replacement: " ",
  type: correctionTypes.UNCERTAIN,
  description: 'Відповідно до § 36 правопису, слово «пів» зі значенням «половина» з наступним іменником (у формі '
    + 'родового відмінка однини) слід писати окремо.'
}));