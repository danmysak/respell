import {groups} from "../includes/grammar.js";
import {getLastLetter} from "./typography.js";

export function getGroup(name) {
  const lastLetter = getLastLetter(name);
  if (getSoft().includes(lastLetter)) {
    return groups.SOFT;
  }
  if (getHushing().includes(lastLetter)) {
    return groups.MIXED;
  }
  return groups.HARD;
}

export function getConsonants(includeSoftSign) {
  return ["б", "в", "г", "ґ", "д", "ж", "з", "й", "к", "л", "м", "н",
          "п", "р", "с", "т", "ф", "х", "ц", "ч", "ш", "щ", ...(includeSoftSign ? ["ь"] : [])];
}

export function getVowels(includeIotified) {
  return ["а", "е", "и", "і", "о", "у", ...(includeIotified ? ["є", "ї", "ю", "я"] : [])];
}

export function getVelars() {
  return ["г", "ґ", "к", "х"];
}

export function getHushing() {
  return ["ж", "ч", "ш", "щ"];
}

export function getHissing(includeSoftened) {
  return ["з", "с", "ц", ...(includeSoftened ? ["зь", "сь", "ць"] : [])];
}

export function getSibilants(includeSoftened) {
  return [...getHushing(), ...getHissing(includeSoftened)];
}

export function getCoronals(includeYot) {
  return ["д", "л", "н", "р", "т", ...getSibilants(false), ...(includeYot ? ["й"] : [])];
}

export function getSoft() {
  return ["й", "ь"];
}