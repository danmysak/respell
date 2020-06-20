import {
  registerWordRule,
  correctionTypes,
  createTreeRule,
  unpackSingleParadigmList,
  isCapitalized,
  getVowels
} from "../imports.js";
import {southSlavicNamesWithI} from "../../data/south-slavic-names-with-i.js";

function convert(root, suffix) {
  return root.replace(new RegExp(`і(?![${[...getVowels(true), 'й', '-'].join('')}])`, 'g'), 'и') + suffix;
}

registerWordRule(createTreeRule(
  unpackSingleParadigmList(southSlavicNamesWithI, (form, group, root, suffix) => [form, convert(root, suffix)]),
  correctionTypes.UNCERTAIN,
  'Відповідно до § 144 правопису, в болгарських, македонських, словенських та сербохорватських іменах кириличну літеру '
    + '«и» або латинську «i» після приголосних українською мовою слід передавати через «и».',
  {
    callback: (token) => isCapitalized(token) && token.includes('і'), // Potential optimization
    fixApostrophe: true
  })
);