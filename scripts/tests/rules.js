import {correctionTypes, TokenChain} from "../spelling/types.js";
import {tokenize} from "../spelling/tokenizer.js";
import {processToken} from "../spelling/processor.js";
import "../rules/rules.js";

const _ = [];

const tests = [
  [2, 'Іч який!', 'Ич який!', correctionTypes.IMPROVEMENT],
  [2, 'А я: «іч, як поважно розкинувся».', 'А я: «ич, як поважно розкинувся».', correctionTypes.IMPROVEMENT],
  [2, 'Птахи відлітають в ірій.', 'Птахи відлітають в ирій.', correctionTypes.IMPROVEMENT],
  [2, 'НЕМАЄ ІРІЮ ПОБЛИЗУ', 'НЕМАЄ ИРІЮ ПОБЛИЗУ', correctionTypes.IMPROVEMENT],
  [2, 'Кожному іроду — по хустинці.', 'Кожному ироду — по хустинці.', correctionTypes.IMPROVEMENT],
  [2, 'Ірод нового часу', 'Ирод нового часу', correctionTypes.IMPROVEMENT],
  [2, 'Різноманітні іродівські штучки вже набридли.', 'Різноманітні иродівські штучки вже набридли.', correctionTypes.IMPROVEMENT],
  [2, 'У Північній Кореї править Кім Чен Ін.', 'У Північній Кореї править Кім Чен Ин.', correctionTypes.MISTAKE],
  [2, 'ОСТАННІЙ ЗАДУМ КІМ ЧЕН ІНА', 'ОСТАННІЙ ЗАДУМ КІМ ЧЕН ИНА', correctionTypes.MISTAKE],
  [_, 'Ін і ян', 'Ін і ян', _],
  [_, 'Це сказав Чен. Інакше тут не вийде.', 'Це сказав Чен. Інакше тут не вийде.', _],
  [_, 'Чен іншого порадити не міг.', 'Чен іншого порадити не міг.', _]
];

let succeeded = 0;
let failed = 0;

tests.forEach(([sections, text, corrected, types]) => {
  const tokens = tokenize(text);
  const replaced = [];
  const chain = new TokenChain(tokens);
  const encounteredTypes = [];
  const encounteredDescriptions = [];
  while (chain.hasMore()) {
    chain.next();
    const application = processToken(chain);
    if (application === null) {
      replaced.push(chain.getCurrentToken());
    } else {
      replaced.push(application.replacement);
      encounteredTypes.push(application.type);
      encounteredDescriptions.push(...application.descriptions);
    }
  }
  const final = replaced.join('');
  const errors = [];
  if (final !== corrected) {
    errors.push(`Results differ: "${final}" instead of expected "${corrected}"`);
  }
  const expectedTypes = (Array.isArray(types) ? types : [types]).join(',');
  const actualTypes = encounteredTypes.join(',');
  if (actualTypes !== expectedTypes) {
    errors.push(`Types differ: "${actualTypes}" instead of expected "${expectedTypes}"`);
  }
  const actualDescriptions = encounteredDescriptions.join('; ');
  (Array.isArray(sections) ? sections : [sections]).forEach((section) => {
    if (!actualDescriptions.match(new RegExp(`§\\s*${section}(?!\d)`))) {
      errors.push(`Section "${section}" not found in descriptions "${actualDescriptions}"`);
    }
  });
  if (errors.length === 0) {
    succeeded++;
  } else {
    console.error(`Test "${text}" failed:`, ...errors);
    failed++;
  }
});

console.log(`Done running ${tests.length} tests: ${succeeded} succeeded, ${failed} failed`);