import {
  correctionTypes,
  registerWordRule,
  createMaskRule,
  parenthesizeFirst,
  determineLetterCase,
  letterCases
} from "../imports.js";

const ending = "ой";
const firstLetterReplacement = "и";
const minLength = 5;

registerWordRule(createMaskRule({
  callback: (token) =>
    [letterCases.CAPITALIZED, letterCases.CAMEL].includes(determineLetterCase(token))
    && token.endsWith(ending) && token.split('-').slice(-1)[0].length >= minLength,
  rules: [{
    matches: [
      [[
        "*ськ", "*цьк",
        "*ев", "*єв", "*ов",
        "благ", "борз", "голуб", "дорог", "друг", "ряб" // These are implicitly excluded from the rule below
      ], parenthesizeFirst(ending)]
    ],
    type: correctionTypes.MISTAKE
  }, {
    matches: ["*" + parenthesizeFirst(ending)],
    antiMatches: [
      [[
        "*б", "*г", "*з", "*р", // generic
        "*отт", "*позат", // "той"
        "*дост", "*нак", "*пок", "*св", // verbs
        "*конв", // nouns
        "*толст", "*хан" // proper names
      ], ending]
    ],
    type: correctionTypes.UNCERTAIN
  }],
  replacement: firstLetterReplacement,
  description: 'Відповідно до § 144 правопису, російські прізвища на «-ой» слід передавати через «-ий» (за винятком '
    + 'прізвища «Толстой»).'
}));