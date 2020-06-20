import {registerWordRule, correctionTypes, createTreeRule, unpackSingleParadigmList} from "../imports.js";
import {lastNamesWithOwe} from "../../data/last-names-with-owe.js";

const pattern = /([ао])(в)(е)/gi;

registerWordRule(createTreeRule(
  unpackSingleParadigmList(
    lastNamesWithOwe, (form) => [form, form.replace(pattern, '$1у$3')]
  ),
  correctionTypes.MISTAKE,
  'Відповідно до § 133 правопису, літеру «w» у складі «-owe-» в англійських прізвищах слід передавати з допомогою «у».',
  {
    callback: (token) => token.match(pattern), // Potential optimization
    fixApostrophe: true
  })
);