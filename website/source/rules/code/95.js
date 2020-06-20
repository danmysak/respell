import {correctionTypes, registerWordRule, labels, createMaskRule} from "../imports.js";

const prepositions = ["у", "в", "на", "по", "при"];

registerWordRule(createMaskRule({
  callback: (token) => token.match(/і$/i), // Potential optimization
  matches: [
    [[
      "*ост",

      "*верт", "*ненавист", "*област", "*повіст", "*смерт", "*страст", "*участ", "*чест",

      "боліст", "віст", "власт", "доблест", "жерст", "завист", "кист", "корист",
      "маст", "напаст", "нечист", "паперт", "пошест", "скатерт", "совіст", "шерст",

      "кров", "любов", "осен", "сол", "Рус", "Білорус"
    ], "(і)"]
  ],
  antiMatches: ["шості"],
  canBeFirst: true,
  previousCallback: (token) => token === null || !prepositions.includes(token.toLowerCase()),
  replacement: "и",
  type: correctionTypes.UNCERTAIN,
  description: 'Відповідно до § 95 правопису, у родовому відмінку однини іменники на «-ть» після приголосного, а також '
    + 'слова «кров», «любов», «осінь», «сіль», «Русь», «Білорусь» можуть набувати як варіант закінчення «-и».'
}), [labels.GENITIVE_Y]);