import {RuleApplication} from "./types.js";

export function parenthesizeFirst(list) {
  return list.map((item) => `(${item[0]})${item.slice(1)}`);
}

export function createWordRule(description) {
  const flattenDescription = (description, extraOptions = {}, currentItems = []) => {
    if (Array.isArray(description)) {
      for (const item of description) {
        flattenDescription(item, extraOptions, currentItems);
      }
    } else if (description.rules) {
      const newOptions = {
        ...description
      };
      delete newOptions.rules
      flattenDescription(description.rules, {
        ...extraOptions,
        ...newOptions
      }, currentItems);
    } else {
      currentItems.push({
        ...extraOptions,
        ...description
      });
    }
    return currentItems;
  };
  const transformMask = (mask) => {
    const stem = Array.isArray(mask) ? mask[0] : mask;
    const endings = (Array.isArray(mask) ? mask[1] : null) || [];
    const normalized = stem
      .replace(/(^|\))(.*?)(\(|$)/g, '$1($2)$3') // We intersperse some extra groups with the existing ones, which
        // gives us the ability to later calculate at which positions all the groups are located in a given match
      .replace(/$/, endings.length > 0 ? `(${endings.join('|')})` : '')
      .replace(/[а-яґєії]/g, (c) => `[${c}${c.toUpperCase()}]`) // For "abc", we also want to match Abc or ABC
      .replace(/['’]/g, "['’]")
      .replace(/[*]/g, '.*');
    return new RegExp(`^${normalized}$`);
  };
  const items = flattenDescription(description);
  items.forEach((item) => {
    for (const key of Object.getOwnPropertyNames(item)) {
      if (key === 'matches' || key.endsWith('Matches')) {
        item[key].forEach((mask, index, list) => {
          list[index] = transformMask(mask);
        });
      }
    }
  });
  return (token, chain) => {
    for (const item of items) {
      if (item.optimizationMatches) {
        if (!item.optimizationMatches.some((mask) => token.match(mask))) {
          continue;
        }
      }
      if (item.previousMatches) {
        const previousToken = chain.getPreviousToken();
        if (!previousToken || !item.previousMatches.some((mask) => previousToken.match(mask))) {
          continue;
        }
      }
      for (const mask of item.matches) {
        if (token.match(mask)) {
          const replacement = token.replace(mask, (match, ...rest) => {
            const groups = rest.slice(0, -2); // The last two parameters are the offset and the string
            return groups.map((group, index) => {
              if (index % 2 === 0 || index === groups.length - 1) { // This is either one of the extra groups or endings
                return group;
              } else { // This is one of the actual groups
                return group === group.toUpperCase() ? item.replacement.toUpperCase() : item.replacement;
              }
            }).join('');
          });
          return new RuleApplication(item.type, replacement, item.description);
        }
      }
    }
    return null;
  };
}