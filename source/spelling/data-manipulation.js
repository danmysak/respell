export function unique(list) {
  return [...new Set(list)];
}

export function arrayify(item) {
  return Array.isArray(item) ? item : [item];
}

export function dearrayify(list) {
  return list.length === 1 ? list[0] : list;
}

export function applyOrMap(items, callback) {
  return Array.isArray(items) ? items.map(callback) : callback(items);
}

export function reduceObjects(a, b) {
  return Object.fromEntries(Object.entries(a).map(([key, value]) => [key, value + b[key]]));
}

export function unpackSingleParadigmList(list, callback, paradigmExtractor = (group) => group.paradigm) {
  return combineCorrespondences(
    list.flatMap((group) => {
      const paradigm = paradigmExtractor(group);
      return paradigm ? group.roots.map((root) => [root, paradigm, group]) : [];
    }).map(
      ([root, paradigm, group]) => Object.fromEntries(paradigm.map(
        (suffix) => callback(root + suffix, group, root, suffix)
      ))
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
    combined[key] = dearrayify(unique(options));
  }
  return combined;
}