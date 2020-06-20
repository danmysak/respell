import {TokenChain} from "../spelling/token-chain.js";
import {tokenize, isWhitespace} from "../spelling/tokenizer.js";
import {processToken} from "../spelling/processor.js";
import {tests} from "./data/rules.js";
import "../rules/rules.js";

function generateRegex(section) {
  return new RegExp(`§\\s*${section}(?!\d)`);
}

function processText(text, omitSections = []) {
  const tokens = tokenize(text);
  const replaced = [];
  const chain = new TokenChain(tokens);
  const encounteredTypes = [];
  const encounteredDescriptions = [];
  let encounteredExtraChange = false;
  let skipNext = false;
  let joinNext = false;
  while (chain.hasMore()) {
    chain.next();
    if (skipNext) {
      skipNext = false;
      if (isWhitespace(chain.getCurrentToken(false))) {
        joinNext = true;
      }
      continue;
    }
    if (joinNext) {
      joinNext = false;
      if (replaced.length > 0) {
        replaced[replaced.length - 1] += chain.getCurrentToken(false);
        continue;
      }
    }
    const corrections = processToken(chain)
      .map(({correction}) => correction)
      .filter((correction) => !omitSections.some(
        (section) => correction.description.match(generateRegex(section))
      )
    );
    if (corrections.length === 0) {
      replaced.push(chain.getCurrentToken(false));
    } else {
      const correction = corrections[0];
      if (replaced.length > 0 && correction.removePreviousToken) {
        replaced.pop();
      }
      if (correction.removeNextToken) {
        skipNext = true;
      }
      replaced.push(correction.replacements[0]);
      encounteredExtraChange = encounteredExtraChange || correction.requiresExtraChange;
      encounteredTypes.push(correction.type);
      encounteredDescriptions.push(correction.description);
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
    if (!Array.isArray(sections)) {
      sections = [sections];
    }
    const expectedSections = sections.filter((section) => section > 0);
    const omitSections = sections.filter((section) => section < 0).map((section) => -section);
    corrected = corrected ?? text;
    types = types ?? [];
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
      } = processText(current, omitSections);
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
    expectedSections.forEach((section) => {
      if (!actualDescriptions.match(generateRegex(section))) {
        errors.push(`Section "${section}" not found in descriptions "${actualDescriptions}"`);
      }
    });
    const reprocessed = processText(processed, omitSections);
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