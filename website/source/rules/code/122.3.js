import {correctionTypes, registerWordRule, createTreeRule, unpackSingleParadigmList} from "../imports.js";
import {namesWithG} from "../../data/names-with-g.js";

const uncertain = [
  "агат", "агата", "агатам", "агатами", "агатах", "агати", "агаті", "агату"
];

const mostCertainlyFalse = [
  "гора", "горам", "горами", "горах", "горе", "гори", "горі", "гору"
];

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
  (token) => uncertain.includes(token.toLowerCase()) ? correctionTypes.UNCERTAIN : correctionTypes.IMPROVEMENT,
  'Відповідно до § 122 правопису, в іменах та прізвищах допускається передавання звука [g] як буквою «г», так і '
    + 'літерою «ґ».',
  {
    fixApostrophe: true,
    postprocess: (values, token) => mostCertainlyFalse.includes(token.toLowerCase()) ? null : values
  })
);