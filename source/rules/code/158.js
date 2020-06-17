import {Correction, correctionTypes, registerWordRule, normalizeCase} from "../imports.js";

const conjunctions = ["і", "й", "та"];
const conjunctionReplacements = {
  "й": "і"
};
const adverbs = ["лише", "тільки"];

registerWordRule((token, chain) => {
  const lowerCased = token.toLowerCase();
  if (conjunctions.includes(lowerCased) && adverbs.includes((chain.getNextToken() || '').toLowerCase())
    && chain.getPreviousToken() !== null
    && (chain.getPreviousToken() || '').toLowerCase() === (chain.getNextToken(2) || '').toLowerCase()) {
    const replacement = ', ' + normalizeCase(
      conjunctionReplacements.hasOwnProperty(lowerCased) ? conjunctionReplacements[lowerCased] : lowerCased,
      token
    );
    return new Correction(correctionTypes.MISTAKE, replacement,
      'Відповідно до § 158 (п. I.4) правопису, у виразі «говорити правду, і тільки правду» та подібних потрібно '
        + 'ставити кому.',
      {
        removePreviousToken: true
      }
    );
  } else {
    return null;
  }
});