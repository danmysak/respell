import {correctionTypes, registerWordRule, createMaskRule, getConsonants} from "../imports.js";

const prefixes = getConsonants(false).map((letter) => '*' + letter);

registerWordRule(createMaskRule({
  matches: [
    [prefixes, "(авелл)*"],
    [prefixes, "(овелл)*"]
  ],
  antiMatches: ["*веллю"],
  replacement: "ауелл",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 133 правопису, англійські прізвища на «-owell» слід передавати через «-ауелл».'
}));