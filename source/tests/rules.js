import {TokenChain} from "../spelling/types.js";
import {tokenize, isWhitespace} from "../spelling/tokenizer.js";
import {processToken} from "../spelling/processor.js";
import {tests} from "./data/rules.js";
import "../rules/rules.js";

function processText(text) {
  const tokens = tokenize(text);
  const replaced = [];
  const chain = new TokenChain(tokens);
  const encounteredTypes = [];
  const encounteredDescriptions = [];
  let encounteredExtraChange = false;
  let skipNext = false;
  while (chain.hasMore()) {
    chain.next();
    if (skipNext) {
      skipNext = false;
      continue;
    }
    const correction = processToken(chain);
    if (correction === null) {
      replaced.push(chain.getCurrentToken());
    } else {
      if (replaced.length > 0 && (correction.removePreviousToken
        || (correction.removeWhitespaceBefore && isWhitespace(replaced[replaced.length - 1])))) {
        replaced.pop();
      }
      if (correction.removeNextToken) {
        skipNext = true;
      }
      replaced.push(correction.replacement);
      encounteredExtraChange = encounteredExtraChange || correction.requiresExtraChange;
      encounteredTypes.push(correction.type);
      encounteredDescriptions.push(...correction.descriptions);
    }
  }
  return {
    processed: replaced.join(''),
    encounteredTypes,
    encounteredDescriptions,
    encounteredExtraChange
  };
}

function test(tests) {
  let succeeded = 0;
  let failed = 0;

  tests.forEach(([sections, text, corrected, types, extraChange, processings]) => {
    extraChange = extraChange || false;
    processings = processings || 1;
    let current = text;
    const encounteredTypes = [];
    const encounteredDescriptions = [];
    let encounteredExtraChange = false;
    for (let i = 0; i < processings; i++) {
      const {
        processed: next,
        encounteredTypes: types,
        encounteredDescriptions: descriptions,
        encounteredExtraChange: extraChange
      } = processText(current);
      current = next;
      encounteredTypes.push(...types);
      encounteredDescriptions.push(...descriptions);
      encounteredExtraChange = encounteredExtraChange || extraChange;
    }
    const processed = current;
    const errors = [];
    if (processed !== corrected) {
      errors.push(`Results differ: "${processed}" instead of expected "${corrected}"`);
    }
    if (encounteredExtraChange !== extraChange) {
      errors.push(`Extra change is ${encounteredExtraChange ? 'required' : 'not required'}, but expected otherwise`);
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
    const reprocessed = processText(processed);
    if (reprocessed.encounteredTypes.length > 0) {
      errors.push(`Reapplication of the rules yielded the following corrections: ` +
        reprocessed.encounteredTypes.join(',') + `; the final text is as follows: "${reprocessed.processed}"`);
    }
    if (errors.length === 0) {
      succeeded++;
    } else {
      console.error(`Test "${text}" failed:`, ...errors);
      failed++;
    }
  });

  console.log(`Done running ${tests.length} tests: ${succeeded} succeeded, ${failed} failed`);
}

test(tests);