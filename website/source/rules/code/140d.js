import {
  Correction,
  correctionTypes,
  registerWordRule,
  labels,
  determineLetterCase,
  unique,
  letterCases,
  decliners,
  getCompatibleNominalForms,
  nominalForms
} from "../imports.js";

const ignoredPatterns = [/^ван-/i, /^(вест|іст|сан|санкт|сен|сент|усть)-/i, /-україн/i];
// "ван" should be spelled as a separate word and is handled by other rules;
// we would also like to ignore words like "Інтерфакс-Україна"

function createRule(description, letterCase, generalDecliner, lastPartUndecliner) {
  return (token, chain) => {
    const parts = token.split('-');
    if (parts.length < 2 || parts.some((part) => part.length <= 1)
      || ignoredPatterns.some((pattern) => token.match(pattern))) {
      return null;
    }
    if (determineLetterCase(token) !== letterCase) {
      return null;
    }
    const lastPart = parts[parts.length - 1];
    const lastPartForms = unique(Object.values(lastPartUndecliner(lastPart)).flat());
    const compatibleForms = getCompatibleNominalForms(chain);
    let suggestions = [];
    compatibleForms.forEach((form) => { // The preferable ordering is of the compatible forms, hence iterating over them
      if (!lastPartForms.includes(form)) {
        return;
      }
      let currentSuggestions = [[]];
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (Object.values(generalDecliner.undecline(part)).flat().includes(form)) {
          currentSuggestions = currentSuggestions.map((suggestion) => [...suggestion, part]);
          continue;
        }
        if (!generalDecliner.check(part)) {
          return;
        }
        const forms = generalDecliner.decline(part, form);
        currentSuggestions = currentSuggestions.flatMap((suggestion) => forms.map((form) => [...suggestion, form]));
      }
      suggestions = unique([
        ...suggestions,
        ...currentSuggestions
          .map((suggestion) => [...suggestion, lastPart].join('-'))
          .filter((suggestion) => suggestion !== token)
      ]);
    });
    return suggestions.length === 0 ? null : new Correction(correctionTypes.UNCERTAIN, suggestions, description);
  };
}

// This rule is only concerned with hyphenated male names (or last names) such as "Жан-Жак" and "Захер-Мазох",
// since other kinds of multipart names should have already been declinable before the orthography 2019.
registerWordRule(
  createRule(
    'Відповідно до § 140 правопису, у багатокомпонентних (з пробілами або дефісами) іменах та прізвищах іншомовного '
      + 'походження, навіть таких, як «Жан-Жак», слід відмінювати всі складники.',
    letterCases.CAMEL, decliners.masculineConsonantalForeign,
    (part) => decliners.masculineConsonantalForeign.undecline(part)
  ), [labels.FOREIGN_NAMES]
);

registerWordRule(
  createRule(
    'Відповідно до § 140 правопису, у чоловічих формах арабських, перських, тюркських імен (але не прізвищ) '
      + 'із частинами, що вказують на родинні стосунки або соціальне становище («огли», «паша» і под.), '
      + 'відмінюються всі відмінювані частини імені.',
    letterCases.CAPITALIZED, decliners.masculineConsonantalForeign,
    (part) => {
      const indeclinableOptions = ['заде', 'огли'];
      const consonantalOptions = ['бей', 'хан'];
      const vocalicOptions = {
        "паша": [nominalForms.NOMINATIVE_SINGULAR], // Not really necessary, but listed for completeness
        "паші": [
          nominalForms.GENITIVE_SINGULAR, nominalForms.DATIVE_SINGULAR, nominalForms.LOCATIVE_SINGULAR,
          nominalForms.NOMINATIVE_PLURAL, nominalForms.VOCATIVE_PLURAL
        ],
        "пашу": [nominalForms.ACCUSATIVE_SINGULAR],
        "пашею": [nominalForms.INSTRUMENTAL_SINGULAR],
        "паше": [nominalForms.VOCATIVE_SINGULAR],
        "пашів": [nominalForms.GENITIVE_PLURAL, nominalForms.ACCUSATIVE_PLURAL],
        "пашам": [nominalForms.DATIVE_PLURAL],
        "пашами": [nominalForms.INSTRUMENTAL_PLURAL],
        "пашах": [nominalForms.LOCATIVE_PLURAL]
      };

      if (indeclinableOptions.includes(part)) {
        return Object.values(nominalForms);
      }
      const consonantalPossibilities = decliners.masculineConsonantalForeign.undecline(part);
      for (const consonantal of consonantalOptions) {
        if (consonantalPossibilities.hasOwnProperty(consonantal)) {
          return consonantalPossibilities[consonantal];
        }
      }
      if (vocalicOptions.hasOwnProperty(part)) {
        return vocalicOptions[part];
      }
      return [];
    }
  ), [labels.FOREIGN_NAMES]
);