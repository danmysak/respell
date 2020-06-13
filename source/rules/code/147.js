import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["ж(ю)л*"],
  replacement: "у",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 147 правопису, ім’я «Жуль» (та пов’язані слова) на загальних підставах слід писати '
    + 'з літерою «у».'
}));