import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: [
    // There are places ending in "водівка" or "дубівка", so the explicit lists are necessary
    [["біло", "блищи", "гнило", "добри", "добро", "лісо", "мало", "печи", "сіно", "черпо", "чорни"], "вод(ів)ськ*"],
    [["пари", "ридо", "рідко", "семи", "сороко", "три"], "дуб(ів)ськ*"],
    [["восьми", "ново", "п'яти", "семи", "три"], "хат(ків)ськ*"]
  ],
  replacement: "",
  type: correctionTypes.MISTAKE,
  description: 'Як продемонстровано у § 154 правопису, прикметникова форма від назви «П’ятихатки» й подібних '
    + 'закінчується на «-хатський», від «Сорокодуби» й подібних — на «-дубський», а від «Печиводи» й подібних — '
    + 'на «-водський».'
}));