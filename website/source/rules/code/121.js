import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: [
    ["*лесс(и)н", ["г*", "ґ*"]]
  ],
  replacement: "і",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 121 правопису, прізвище «Лессінг» слід писати з літерою «і».'
}));