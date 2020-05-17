import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["*(й)є*", "*(й)ї*", "*(й)ю*", "*(й)я*"],
  antiMatches: ["най*", "щонай*", "якнай*"],
  replacement: "",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 126 правопису, на позначення сполучень звуків [je], [ji], [ju], [ja] '
    + 'в іншомовних власних та загальних назвах ніколи не пишуть літеру «й» перед «є», «ї», «ю» чи «я».'
}));