import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["щур(и)"],
  replacement: "і",
  type: correctionTypes.IMPROVEMENT,
  description: 'Відповідно до § 67 правопису, іменник «щур» може мати у формі називного відмінка множини альтернативні '
    + 'форми «щури» та «щурі».'
}));