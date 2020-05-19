import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  callback: (token) => token.match(/кк/i), // Potential optimization
  matches: [
    "бек(к)ер*", "бек(к)ет*", "бек(к)і*", "брок(к)ес*", "*брюк(к)*", "бюк(к)ебур*",
    "вік(к)ерс*", "гек(к)ел*", "дік(к)енс*", "зек(к)ау*", "кентук(к)і*", "лок(к)*",
    "лук(к)енвальде*", "нек(к)ар*", "ок(к)ам*", "тек(к)ере*", "цвік(к)ау*"
  ],
  replacement: "",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 128 правопису, буквосполучення «ck» германських мов слід передавати однією літерою «к».'
}));

registerWordRule(createMaskRule({
  matches: ["ма(к)ензі*", "ма(к-к)ензі*", "ма(к)інлі*", "ма(к-к)інлі*"],
  replacement: "кк",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 128 правопису, правильним є написання «Маккензі» та «Маккінлі».'
}));