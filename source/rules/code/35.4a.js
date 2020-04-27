import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: [
    [["багат", "свят"], "(-)", ["вечір*", "вечор*"]]
  ],
  replacement: "",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 35 правопису, слова «багатвечір» та «Святвечір» слід писати разом.'
}));