import {Correction, correctionTypes, registerWordRule} from "../imports.js";

const pattern = /^([1-9]\d{0,2})(-?)([а-зґє])$/i;

const mainDescription = 'Відповідно до § 35 правопису, найменування класів, будинків, корпусів, поштових відділень '
  + 'тощо слід писати через дефіс у форматі «10-А».';
const extraDescription = 'Натомість закінчення порядкових числівників мають починатися з приголосного (див. § 64).';

function getOrdinalNumberSuffixes(number) {
  const defaultSuffixes = ['та', 'те'];
  const lastTwo = number % 100;
  if (lastTwo > 10 && lastTwo < 20) {
    return defaultSuffixes;
  } else if (lastTwo === 40) {
    return ['ва', 'ве'];
  } else {
    const last = lastTwo % 10;
    switch (last) {
      case 1:
        return ['ша', 'ше'];
      case 2:
        return ['га', 'ге'];
      case 3:
        return ['тє'];
      case 7:
      case 8:
        return ['ма', 'ме'];
      default:
        return defaultSuffixes;
    }
  }
}

function formatReplacement(number, suffix) {
  return `${number}-${suffix}`;
}

function isInWrongContext(chain) {
  return chain.getPreviousToken(1, false) === '.'
    || (chain.getPreviousToken() === '.' && (chain.getPreviousToken(2) || '').toLowerCase() === 'п');
}

registerWordRule((token, chain) => {
  const match = token.match(pattern);
  if (!match || isInWrongContext(chain)) {
    return null;
  }
  const [_, number, hyphen, letter] = match;
  const mainReplacement = formatReplacement(number, letter.toUpperCase());
  if (mainReplacement === token) {
    return null;
  }
  const extraReplacements = [];
  if (letter === letter.toLowerCase()) {
    extraReplacements.push(
      ...getOrdinalNumberSuffixes(+number)
        .filter((suffix) => suffix.endsWith(letter))
        .map((suffix) => formatReplacement(number, suffix))
    );
  }
  const description = mainDescription + (extraReplacements.length === 0 ? '' : ' ' + extraDescription);
  return new Correction(correctionTypes.MISTAKE, [mainReplacement, ...extraReplacements], description);
});