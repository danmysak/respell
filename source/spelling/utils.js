import {canBeSentenceBoundary, isWord} from "./tokenizer.js";

export const cases = {
  EMPTY: 'empty',
  LOWER: 'lower',
  CAPITALIZED: 'capitalized',
  UPPER: 'upper',
  CAMEL: 'camel',
  OTHER: 'other'
};

export function parenthesizeFirst(items) {
  return applyOrMap(items, (item) => `(${item[0]})${item.slice(1)}`);
}

export function getLastLetter(string) {
  return string === '' ? '' : string[string.length - 1];
}

export function getConsonants(includeSoftSign) {
  return ["б", "в", "г", "ґ", "д", "ж", "з", "й", "к", "л", "м", "н",
          "п", "р", "с", "т", "ф", "х", "ц", "ч", "ш", "щ", ...(includeSoftSign ? ["ь"] : [])];
}

export function getVowels(includeIotified) {
  return ["а", "е", "и", "і", "о", "у", ...(includeIotified ? ["є", "ї", "ю", "я"] : [])];
}

export function getSibilants(includeSoftened) {
  return ["ж", "з", "с", "ц", "ч", "ш", "щ", ...(includeSoftened ? ["зь", "сь", "ць"] : [])];
}

export function simplifyApostrophe(string) {
  return string.replace(/’/g, "'");
}

export function normalizeApostrophe(string, model) {
  return model.includes("'") ? simplifyApostrophe(string) : string.replace(/'/g, '’');
}

export function capitalize(string) {
  return string.length === '' ? string : string[0].toUpperCase() + string.slice(1).toLowerCase();
}

export function determineCase(string) {
  if (string === '') {
    return cases.EMPTY;
  }
  if (string === string.toLowerCase()) {
    return cases.LOWER;
  }
  if (string === capitalize(string)) {
    return cases.CAPITALIZED;
  }
  if (string === string.toUpperCase()) {
    return cases.UPPER;
  }
  const parts = string.split('-');
  if (parts.length > 1 && parts.every((part) => part !== '' && part === capitalize(part))) {
    return cases.CAMEL;
  }
  return cases.OTHER;
}

export function isCapitalized(string) {
  return determineCase(string) === cases.CAPITALIZED;
}

export function normalizeCase(string, model) {
  switch (determineCase(model)) {
    case cases.CAPITALIZED:
      return capitalize(string);
    case cases.UPPER:
      return string.toUpperCase();
    case cases.CAMEL:
      return string.split('-').map((part) => capitalize(part)).join('-');
    default:
      return string;
  }
}

export function arrayify(item) {
  return Array.isArray(item) ? item : [item];
}

function applyOrMap(items, callback) {
  return Array.isArray(items) ? items.map(callback) : callback(items);
}

export function unpackSingleParadigmList(list, callback, paradigmExtractor = (group) => group.paradigm) {
  return combineCorrespondences(
    list.flatMap((group) => {
      const paradigm = paradigmExtractor(group);
      return paradigm ? group.roots.map((root) => [root, paradigm]) : [];
    }).map(
      ([root, paradigm]) => Object.fromEntries(paradigm.map((suffix) => callback(root + suffix)))
    )
  );
}

export function unpackDoubleParadigm(paradigm, left, right = left, valueCallback = (string) => string) {
  const unpacked = {};
  for (const leftEnding of Object.keys(paradigm)) {
    unpacked[`${left}${leftEnding}`] =
      applyOrMap(paradigm[leftEnding], (rightEnding) => valueCallback(`${right}${rightEnding}`, leftEnding));
  }
  return unpacked;
}

export function combineCorrespondences(list) {
  const combined = {};
  // First we need to collect all sets of options transforming them into arrays when necessary
  for (const set of list) {
    for (const key of Object.keys(set)) {
      if (!combined.hasOwnProperty(key)) {
        combined[key] = [];
      }
      const value = set[key];
      combined[key].push(Array.isArray(value) ? value : [value]);
    }
  }
  // Now rearranging sets of options so that all first options of their sets come first, then all second ones, etc.
  for (const key of Object.keys(combined)) {
    const sets = combined[key];
    const options = [];
    let currentIndex = 0;
    while (true) {
      let encountered = false;
      for (const set of sets) {
        if (currentIndex < set.length) {
          options.push(set[currentIndex]);
          encountered = true;
        }
      }
      if (!encountered) {
        break;
      }
      currentIndex++;
    }
    combined[key] = options.length === 1 ? options[0] : options;
  }
  return combined;
}

export function isAfterSentenceBoundary(chain) {
  let level = 1;
  while (true) {
    const token = chain.getPreviousToken(level);
    if (isWord(token)) {
      return false;
    }
    if (canBeSentenceBoundary(token)) {
      return true;
    }
    level++;
  }
}