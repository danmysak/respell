import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["клу(з)ьк*"],
  replacement: "жс",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 153 правопису, прикметникову форму від назви «Клуж» слід записувати як «клужський».'
}));

registerWordRule(createMaskRule({
  matches: ["пе(ц)ьк*"],
  replacement: "чс",
  type: correctionTypes.UNCERTAIN, // "Пецькі" is a Polish town; "Пецька" could be a name
  description: 'Відповідно до § 153 правопису, прикметникову форму від назви міста «Печ» слід записувати як «печський».'
}));