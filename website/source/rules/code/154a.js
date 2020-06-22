import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["с(и)лезі*"],
  replacement: "і",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 154 правопису, назву «Сілезія» слід на загальних підставах писати з літерою «і» '
    + 'в першому складі.'
}));

registerWordRule(createMaskRule({
  matches: [
    [["гостро", "сухо"], "лу(ц)ьк+"]
  ],
  replacement: "чанс",
  type: correctionTypes.MISTAKE,
  description: 'Як продемонстровано у § 154 правопису, прикметникову форму від назви «Гостролуччя» слід записувати '
    + 'як «гостролучанський», а від «Сухолуччя» за аналогією — як «сухолучанський».'
}));

registerWordRule(createMaskRule({
  matches: ["сорок(а)дуб*"],
  replacement: "о",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 154 правопису, назву села Сорокодуби слід писати зі сполучним «о».'
}));

registerWordRule(createMaskRule({
  matches: ["атлант(и)к-*"],
  replacement: "і",
  type: correctionTypes.MISTAKE,
  description: 'Як продемонстровано у § 154 правопису, складову «Атлантік» у географічних назвах слід писати з літерою '
    + '«і».'
}));