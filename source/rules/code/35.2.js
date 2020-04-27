import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

const prefixes = ["", "*сто", "*тисяча"];
const numeralRoots = ["сот", "тисячн", "мільйонн", "мільярдн", "трильйонн", "трильярдн"];
const rules = [
  ["дво|х", "", ["хвилинн", "хвильов", "хвіст", "хвост", "хлорист", "ходів", "ходов", "хромов"]],
  ["тр|ьох", "и"],
  ["чотир|ьох", "и"]
];

registerWordRule(createMaskRule({
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 35 правопису, числівники «два», «три», «чотири» виступають у складних іменниках та '
    + 'прикметниках (але не в числівниках) у формах «дво-», «три-», «чотири-», навіть коли основа за ними починається '
    + 'на голосний.',
  rules: rules.map(([match, replacement, antiMatches]) => ({
    matches: ["'", ""].map((postfix) => [prefixes, `${match.replace('|', '(')}${postfix})*`]),
    antiMatches: [
      [match.replace('|', '')],
      (antiMatches || []).map((root) => [prefixes, `${match.split('|')[0]}${root}*`]),
      numeralRoots.map((root) => [prefixes, `${match.replace('|', '')}${root}*`])
    ].flat(),
    replacement
  }))
}));