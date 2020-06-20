import {nominalForms, groups} from "../includes/grammar.js";
import {getGroup, getConsonants, getVowels, getVelars, getCoronals, getHushing} from "./phonetics.js";
import {getLastLetter} from "./typography.js";
import {arrayify, unique} from "./data-manipulation.js";

function append(word, endings) {
  return arrayify(endings).map((ending) => word + ending);
}

function replaceLast(word, endings) {
  return arrayify(endings).map((ending) => word.slice(0, -1) + ending);
}

export const decliners = {
  masculineConsonantalForeign: class {
    static check(word) {
      return getConsonants(true).includes(getLastLetter(word));
    }

    static decline(word, form) {
      if (!this.check(word)) {
        return [];
      }
      const group = getGroup(word);
      const lastLetter = getLastLetter(word);
      switch (form) {
        case nominalForms.GENITIVE_SINGULAR:
        case nominalForms.ACCUSATIVE_SINGULAR:
          if (group === groups.SOFT) {
            return replaceLast(word, 'я');
          } else {
            return append(word, 'а');
          }
        case nominalForms.DATIVE_SINGULAR:
          switch (group) {
            case groups.SOFT:
              return replaceLast(word, ['ю', lastLetter === 'й' ? 'єві' : 'еві']);
            case groups.MIXED:
              return append(word, ['у', 'еві']);
            default:
              return append(word, ['у', 'ові']);
          }
        case nominalForms.INSTRUMENTAL_SINGULAR:
          switch (group) {
            case groups.SOFT:
              return replaceLast(word, lastLetter === 'й' ? 'єм' : 'ем');
            case groups.MIXED:
              return append(word, 'ем');
            default:
              return append(word, 'ом');
          }
        case nominalForms.LOCATIVE_SINGULAR:
          switch (group) {
            case groups.SOFT:
              return replaceLast(word, lastLetter === 'й' ? ['ї', 'єві'] : ['і', 'еві']);
            case groups.MIXED:
              return append(word, ['і', 'еві']);
            default:
              return append(word, [getVelars().includes(lastLetter) ? 'у' : 'і', 'ові']);
          }
        case nominalForms.VOCATIVE_SINGULAR:
          if (group === groups.SOFT) {
            return replaceLast(word, 'ю');
          } else if (getVelars().includes(lastLetter)) {
            return append(word, 'у');
          } else if (['ч', 'щ'].includes(lastLetter)) {
            return append(word, ['у', 'е']);
          } else {
            return append(word, 'е');
          }
        case nominalForms.NOMINATIVE_PLURAL:
        case nominalForms.VOCATIVE_PLURAL:
          switch (group) {
            case groups.SOFT:
              return replaceLast(word, lastLetter === 'й' ? 'ї' : 'і');
            case groups.MIXED:
              return append(word, 'і');
            default:
              return append(word, 'и');
          }
        case nominalForms.GENITIVE_PLURAL:
        case nominalForms.ACCUSATIVE_PLURAL:
          if (group === groups.SOFT) {
            return replaceLast(word, lastLetter === 'й' ? 'їв' : 'ів');
          } else {
            return append(word, 'ів');
          }
        case nominalForms.DATIVE_PLURAL:
          if (group === groups.SOFT) {
            return replaceLast(word, 'ям');
          } else {
            return append(word, 'ам');
          }
        case nominalForms.INSTRUMENTAL_PLURAL:
          if (group === groups.SOFT) {
            return replaceLast(word, 'ями');
          } else {
            return append(word, 'ами');
          }
        case nominalForms.LOCATIVE_PLURAL:
          if (group === groups.SOFT) {
            return replaceLast(word, 'ях');
          } else {
            return append(word, 'ах');
          }
        default:
          return [word];
      }
    }

    static undecline(word) {
      const possibilities = unique(word.split('').flatMap((lastLetter, index, allLetters) => {
        if (index === 0) {
          return [];
        }
        const stem = allLetters.slice(0, index + 1).join('');
        if (getCoronals(false).includes(lastLetter) && !getHushing().includes(lastLetter)) {
          return [stem, stem + 'ь'];
        } else if (getConsonants(true).includes(lastLetter)) {
          return [stem];
        } else if (getVowels(true).includes(lastLetter)) {
          return [stem + 'й'];
        } else { // Apostrophe, digit, hyphen, etc., or even a capital letter
          return [];
        }
      }));
      const forms = Object.values(nominalForms);
      return Object.fromEntries(possibilities.map(
        (possibility) => [possibility, forms.filter((form) => this.decline(possibility, form).includes(word))]
      ).filter(([_, forms]) => forms.length > 0));
    }
  },

  feminineConsonantalForeign: class {
    static check(word) {
      const lastLetter = getLastLetter(word);
      return lastLetter !== 'й' && getConsonants(true).includes(lastLetter);
    }

    static decline(word, form) {
      if (!this.check(word)) {
        return [];
      }
      const soft = getLastLetter(word) === 'ь';
      switch (form) {
        case nominalForms.GENITIVE_SINGULAR:
        case nominalForms.DATIVE_SINGULAR:
        case nominalForms.LOCATIVE_SINGULAR:
        case nominalForms.NOMINATIVE_PLURAL:
        case nominalForms.VOCATIVE_PLURAL:
          return soft ? replaceLast(word, 'і') : append(word, 'і');
        case nominalForms.INSTRUMENTAL_SINGULAR:
          if (soft) {
            const secondLast = word.length >= 2 ? word[word.length - 2].toLowerCase() : '';
            const thirdLast = word.length >= 3 ? word[word.length - 3].toLowerCase() : '';
            return replaceLast(word, (getVowels(true).includes(thirdLast) ? secondLast : '') + 'ю');
          } else {
            return append(word, '\'ю');
          }
        case nominalForms.VOCATIVE_SINGULAR:
          return soft ? replaceLast(word, 'е') : append(word, 'е');
        case nominalForms.GENITIVE_PLURAL:
        case nominalForms.ACCUSATIVE_PLURAL:
          return soft ? replaceLast(word, 'ей') : append(word, 'ей');
        case nominalForms.DATIVE_PLURAL:
          return soft ? replaceLast(word, 'ям') : append(word, '\'ям');
        case nominalForms.INSTRUMENTAL_PLURAL:
          return soft ? replaceLast(word, 'ями') : append(word, '\'ями');
        case nominalForms.LOCATIVE_PLURAL:
          return soft ? replaceLast(word, 'ях') : append(word, '\'ях');
        default:
          return [word];
      }
    }
  }
};