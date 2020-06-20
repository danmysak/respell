import {
  Correction,
  correctionTypes,
  registerWordRule,
  getConsonants,
  getVowels,
  normalizeCase
} from "../imports.js";

const prefixes = ["бод"];
const letters = {
  "и": getConsonants(false),
  "і": getVowels(true)
};

const pattern = new RegExp(`^(${prefixes.join('|')})(${Object.keys(letters).join('|')})(-?)(.+)$`, 'i');

registerWordRule((token) => {
  const match = token.match(pattern);
  if (!match) {
    return null;
  }
  const [_, prefix, letter, hyphen, postfix] = match;
  const properLetter = Object.keys(letters).find((letter) => letters[letter].includes(postfix[0].toLowerCase()));
  const letterReplacement = properLetter ? normalizeCase(properLetter, letter) : letter;
  const replacement = [prefix, letterReplacement, postfix].join('');
  if (replacement === token) {
    return null;
  }
  return new Correction(correctionTypes.MISTAKE, replacement,
    'Відповідно до § 35 правопису, слова з початковим компонентом «боді-»/«боди-» слід писати разом, причому перед '
      + 'голосним вживаємо «боді-», а перед приголосним — «боди-».'
  );
});