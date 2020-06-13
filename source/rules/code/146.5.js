import {correctionTypes, registerWordRule, createTreeRule, arrayify, unique, simplifyApostrophe} from "../imports.js";
import {multipartNames, multipartNameParadigms, multipartNameFormCount} from "../../data/multipart-names.js";

function normalize(string) {
  return simplifyApostrophe(string.toLowerCase());
}

function generateParadigmIndex(paradigms) {
  const paradigmIndex = {};
  paradigms.forEach(({paradigm, words}) => {
    words.forEach((word) => {
      paradigmIndex[word] = paradigm;
    });
  });
  return paradigmIndex;
}

function decline(word, formId, paradigmIndex) {
  const paradigm = paradigmIndex[word];
  const root = word.slice(0, word.length - arrayify(paradigm[0]).find((ending) => word.endsWith(ending)).length);
  return arrayify(paradigm[formId]).map((ending) => root + ending);
}

function generateCollocations(names, paradigmIndex) {
  const collocationIndex = {};
  const normalizeNested = (list) => list.map((items) => items.map((item) => normalize(item)));
  const addToIndex = (nominative, options, before, after) => {
    const indexKey = normalize(nominative);
    if (!collocationIndex.hasOwnProperty(indexKey)) {
      collocationIndex[indexKey] = [];
    }
    collocationIndex[indexKey].push({
      options: options.map(normalize),
      before: normalizeNested(before),
      after: normalizeNested(after)
    });
  };
  const getDeclinedOptions =
    (options, formId) => arrayify(options).flatMap((word) => decline(word, formId, paradigmIndex));
  for (const [heads, attributes] of names) {
    for (let attributeIndex = 0; attributeIndex < attributes.length; attributeIndex++) {
      for (const attribute of arrayify(attributes[attributeIndex])) {
        for (let formId = 0; formId < multipartNameFormCount; formId++) {
          // formId === 0 (the nominative) should be included so that we keep track of whether the nominative might
          // actually be the target case: if so, the correction will be presented as UNCERTAIN (see the implementation
          // of createTreeRule)
          const before = [];
          const after = [];
          heads.forEach((options) => before.push(getDeclinedOptions(options, formId)));
          attributes.forEach((options, index) => {
            if (index === attributeIndex) {
              return;
            }
            const forms = [];
            for (const attributeFormId of unique([0, formId])) {
              // Some of the other attribute words may already be put into the target case while some other may remain
              // in the nominative case
              forms.push(getDeclinedOptions(options, attributeFormId));
            }
            (index < attributeIndex ? before : after).push(unique(forms.flat()));
          });
          addToIndex(attribute, decline(attribute, formId, paradigmIndex), before, after);
        }
      }
    }
  }
  return collocationIndex;
}

function extractOptions(collocationSets) {
  return unique(collocationSets.flatMap(({options}) => options));
}

function postprocess(collocationIndex, options, token, chain, key) {
  const collocationSets = collocationIndex[key];
  return extractOptions(collocationSets.filter(({before, after}) => {
    const slots = [
      ...before.map((forms, index) => [index - before.length, forms]),
      ...after.map((forms, index) => [index + 1, forms])
    ];
    for (const [level, forms] of slots) {
      const token = chain.getAdjacentToken(level, true);
      if (token === null || !forms.includes(normalize(token))) {
        return false;
      }
    }
    return true;
  }));
}

const collocationIndex = generateCollocations(multipartNames, generateParadigmIndex(multipartNameParadigms));

registerWordRule(createTreeRule(
  Object.fromEntries(Object.entries(collocationIndex).map(([word, sets]) => [word, extractOptions(sets)])),
  correctionTypes.MISTAKE,
  'Відповідно до § 146 правопису, у складених прізвиськах на кшталт «Річард Левове Серце» потрібно відмінювати кожну '
    + 'з частин.',
  {
    postprocess: postprocess.bind(null, collocationIndex),
    lowerCase: true,
    fixApostrophe: true
  })
);