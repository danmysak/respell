import {Correction} from "./correction.js";
import {normalizeCase, determineLetterCase} from "./typography.js";
import {letterCases} from "../includes/typography.js";
import {arrayify} from "./data-manipulation.js";

export function createMaskRule(description) {
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
      .replace(/[*]/g, '.*')
      .replace(/[+]/g, '.+');
    return new RegExp(`^${normalized}$`);
  };
  const flattened = flattenDescription(description);
  const items = flattened.map((item) => Object.fromEntries(Object.entries(item).map(([key, value]) => {
    return [key, (key === 'matches' || key.endsWith('Matches')) ? value.map(transformMask) : value];
  })));
  return (token, chain) => {
    for (const item of items) {
      if (item.callback) {
        if (!item.callback(token, chain)) {
          continue;
        }
      }
      const matchingMask = item.matches.find((mask) => token.match(mask));
      if (!matchingMask) {
        continue;
      }
      if (item.antiMatches) {
        if (item.antiMatches.some((antiMask) => token.match(antiMask))) {
          continue;
        }
      }
      const inspectAdjacent = (adjacentToken, canBeNull, adjacentMatches, adjacentCallback) => {
        if (canBeNull === false && !adjacentToken) {
          return false;
        }
        if (adjacentMatches) {
          if (!adjacentToken || !adjacentMatches.some((mask) => adjacentToken.match(mask))) {
            return false;
          }
        }
        if (adjacentCallback) {
          if ((canBeNull !== true && !adjacentToken) || !adjacentCallback(adjacentToken)) {
            return false;
          }
        }
        return true;
      };
      if (!inspectAdjacent(chain.getPreviousToken(), item.canBeFirst, item.previousMatches, item.previousCallback) ||
        !inspectAdjacent(chain.getNextToken(), item.canBeLast, item.nextMatches, item.nextCallback)) {
        continue;
      }
      const replacements = arrayify(item.replacement).map(
        (replacement) => token.replace(matchingMask, (match, ...rest) => {
          const groups = rest.slice(0, -2); // The last two parameters are the offset and the string
          return groups.map((group, index) => {
            if (index % 2 === 1 || index === 0 || index === groups.length - 1) {
              // This is either one of the extra groups, or prefixes, or suffixes
              return group;
            } else {
              // This is one of the actual groups
              if (determineLetterCase(token) === letterCases.UPPER) {
                return replacement.toUpperCase();
              } else if (item.preserveReplacementCase || replacement.toLowerCase() !== replacement) {
                return replacement;
              } else {
                return normalizeCase(replacement, group);
              }
            }
          }).join('');
        })
      );
      return new Correction(item.type, replacements, item.description, {
        removePreviousToken: item.removePreviousToken,
        removeNextToken: item.removeNextToken
      });
    }
    return null;
  };
}