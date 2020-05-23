import {correctionTypes, registerWordRule, createTreeRule, unpackSingleParadigmList} from "../imports.js";
import {namesWithG} from "../../data/names-with-g.js";

registerWordRule(createTreeRule(
  unpackSingleParadigmList(namesWithG, (form, group) => [form, form.replace(/г/ig, (match, offset) => {
    if (group.skipFirst && offset === 0) {
      return match;
    } else if (match === match.toUpperCase()) {
      return 'Ґ';
    } else {
      return 'ґ';
    }
  })]),
  correctionTypes.IMPROVEMENT,
  'Відповідно до § 122 правопису, в іменах та прізвищах допускається передавання звука [g] як буквою «г», так і '
    + 'літерою «ґ».',
  {
    fixApostrophe: true
  })
);