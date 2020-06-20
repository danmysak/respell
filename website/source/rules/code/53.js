import {correctionTypes, registerWordRule, createMaskRule, parenthesizeFirst, capitalize} from "../imports.js";

registerWordRule(createMaskRule({
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 53 правопису, у найменуваннях церковних посадових осіб «Папа Римський», '
    + '«Вселенський Патріарх» та «Верховний Архиєпископ» обидва слова слід писати з великої літери.',
  rules: [["пап", "римськ"], ["вселенськ", "патріарх"], ["верховн", "архиєпископ"], ["верховн", "архієпископ"]].flatMap(
    ([first, second]) => [{
      matches: [parenthesizeFirst(first) + '*'],
      antiMatches: [capitalize(first) + '*'],
      nextMatches: [second + '*'],
      replacement: first[0].toUpperCase()
    }, {
      matches: [parenthesizeFirst(second) + '*'],
      antiMatches: [capitalize(second) + '*'],
      previousMatches: [first + '*'],
      replacement: second[0].toUpperCase()
    }]
  )
}));