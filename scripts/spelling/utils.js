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
    mask = Array.isArray(mask) ? mask : [mask];
    const stemIndex = mask.findIndex((item) => !Array.isArray(item));
    const prefixes = stemIndex > 0 ? mask[stemIndex - 1] : [];
    const suffixes = stemIndex + 1 < mask.length ? mask[stemIndex + 1] : [];
    const normalized = mask[stemIndex]
      .replace(/(^|\))(.*?)(\(|$)/g, '$1($2)$3') // We intersperse some extra groups with the existing ones, which
        // gives us the ability to later calculate at which positions all the groups are located in a given match
      .replace(/^/, `(${prefixes.join('|')})`)
      .replace(/$/, `(${suffixes.join('|')})`)
      .replace(/[а-яґєії]/g, (c) => `[${c}${c.toUpperCase()}]`) // For "abc", we also want to match Abc or ABC
      .replace(/['’]/g, "['’]")
      .replace(/[*]/g, '.*');
    return new RegExp(`^${normalized}$`);
  };
  const flattened = flattenDescription(description);
  const items = flattened.map((item) => Object.fromEntries(Object.entries(item).map(([key, value]) => {
    return [key, (key === 'matches' || key.endsWith('Matches')) ? value.map(transformMask) : value];
  })));
  return (token, chain) => {
    for (const item of items) {
      if (item.optimizationMatches) {
        if (!item.optimizationMatches.some((mask) => token.match(mask))) {
          continue;
        }
      }
      const matchingMask = item.matches.find((mask) => token.match(mask));
      if (!matchingMask) {
        continue;
      }
      const previousToken = chain.getPreviousToken();
      const nextToken = chain.getNextToken();
      if (item.previousMatches) {
        if (!previousToken || !item.previousMatches.some((mask) => previousToken.match(mask))) {
          continue;
        }
      }
      if (item.previousCallback) {
        if (!previousToken || !item.previousCallback(previousToken)) {
          continue;
        }
      }
      if (item.nextMatches) {
        if (!nextToken || !item.nextMatches.some((mask) => nextToken.match(mask))) {
          continue;
        }
      }
      if (item.nextCallback) {
        if (!nextToken || !item.nextCallback(nextToken)) {
          continue;
        }
      }
      const replacement = token.replace(matchingMask, (match, ...rest) => {
        const groups = rest.slice(0, -2); // The last two parameters are the offset and the string
        return groups.map((group, index) => {
          if (index % 2 === 1 || index === 0 || index === groups.length - 1) {
            // This is either one of the extra groups, or prefixes, or suffixes
            return group;
          } else {
            // This is one of the actual groups
            return group === group.toUpperCase() ? item.replacement.toUpperCase() : item.replacement;
          }
        }).join('');
      });
      return new RuleApplication(item.type, replacement, item.description);
    }
    return null;
  };
}