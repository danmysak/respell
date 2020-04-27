export const cases = {
  EMPTY: 'empty',
  LOWER: 'lower',
  CAPITALIZED: 'capitalized',
  UPPER: 'upper',
  OTHER: 'other'
};

export function parenthesizeFirst(list) {
  return list.map((item) => `(${item[0]})${item.slice(1)}`);
}

export function canBeSentenceBoundary(isExisting, token) {
  return !isExisting || token.match(/[.?!]/);
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

export function normalizeApostrophe(string) {
  return string.replace(/'/g, '’');
}

function capitalize(string) {
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
  return cases.OTHER;
}

export function normalizeCase(string, model) {
  switch (determineCase(model)) {
    case cases.CAPITALIZED:
      return capitalize(string);
    case cases.UPPER:
      return string.toUpperCase();
    default:
      return string;
  }
}

function applyOrMap(items, callback) {
  return Array.isArray(items) ? items.map(callback) : callback(items);
}

export function unpackParadigm(paradigm, left, right, valueCallback = (string) => string) {
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