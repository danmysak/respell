import {cases, number, nominalForms, frequency} from "../includes/grammar.js";
import {canBeSentenceBoundary, isWord} from "./tokenizer.js";
import {prepositions} from "../data/prepositions.js";

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

function getPrepositionCaseData(token) {
  if (!isWord(token)) {
    return null;
  }
  const normalized = token.toLowerCase();
  return prepositions.hasOwnProperty(normalized) ? prepositions[normalized] : null;
}

// More frequent first, then less frequent
export function getCompatibleNominalForms(chain) {
  const allForms = Object.values(nominalForms);
  const caseData = getPrepositionCaseData(chain.getPreviousToken());
  if (caseData === null) {
    if ([',', 'і', 'й', 'та', 'або', 'чи'].includes(chain.getPreviousToken())) {
      return allForms;
    } else {
      return allForms.filter((form) => form.case !== cases.LOCATIVE);
    }
  }
  const frequencyOrder = Object.values(frequency);
  const numberOrder = Object.values(number);
  const compatibleCases = Object.entries(caseData).sort(
    ([, a], [, b]) => frequencyOrder.indexOf(a) - frequencyOrder.indexOf(b)
  ).map(([wordCase]) => wordCase);
  return allForms
    .filter((form) => compatibleCases.includes(form.case))
    .sort((a, b) =>
      (numberOrder.indexOf(a.number) - numberOrder.indexOf(b.number))
      || (compatibleCases.indexOf(a.case) - compatibleCases.indexOf(b.case))
    );
}

export function isArabicNumeral(string) {
  return string.match(/^(\d[\d.,]*)?\d$/);
}

export function isRomanNumeral(string) {
  return string.match(/^[IVXLCDM]+$/);
}