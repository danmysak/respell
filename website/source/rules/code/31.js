import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: [
    ["арх(і)", ["абат*", "диякон*", "єпарх*", "єпископ*", "єре*", "мандрит*", "пастир*", "страти*"]]
  ],
  replacement: "и",
  type: correctionTypes.IMPROVEMENT,
  description: 'Відповідно до § 31 правопису, у назвах церковних звань, титулів та чинів можна паралельно вживати '
    + 'префікси «архі-» та «архи-».'
}));