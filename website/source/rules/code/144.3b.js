import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["Нар(е)жн*"],
  replacement: "є",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 144 правопису, російське прізвище українського походження «Нарежный» слід передавати '
    + 'як «Нарєжний».'
}));