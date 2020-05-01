import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

const days = ["День", "Дн*"];

registerWordRule(createMaskRule({
  matches: ["(П)еремоги"],
  antiMatches: ["ПЕРЕМОГИ"],
  previousMatches: days,
  replacement: "п",
  preserveReplacementCase: true,
  type: correctionTypes.MISTAKE,
  description: 'Згідно з загальними правилами, поданими у § 52 правопису, у назві свята «День перемоги» друге слово '
    + 'слід писати з малої літери.'
}));

registerWordRule(createMaskRule({
  matches: ["(с)оборності"],
  antiMatches: ["Соборності"],
  previousMatches: days,
  replacement: "С",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 52 правопису, у назві свята «День Соборності України» всі три слова слід писати '
    + 'з великої літери.'
}));

registerWordRule(createMaskRule({
  preserveReplacementCase: true,
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 52 правопису, словосполучення «8 березня» та «1 травня» немає підстав уважати назвами '
    + 'свят і писати в них друге слово з великої літери.',
  rules: [{
    matches: ["(Б)ерезня"],
    antiMatches: ["БЕРЕЗНЯ"],
    previousMatches: ["8", "8-*"],
    replacement: "б",
  }, {
    matches: ["(Т)равня"],
    antiMatches: ["ТРАВНЯ"],
    previousMatches: ["1", "1-*"],
    replacement: "т",
  }]
}));