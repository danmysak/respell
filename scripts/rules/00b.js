import {registerWordRule} from "../spellcheck/storage.js";
import {correctionTypes, RuleApplication} from "../spellcheck/spellchecker.js";

registerWordRule((token) => {
  if (token.includes('о')) {
    return new RuleApplication(correctionTypes.MISTAKE, token.replace(/о/g, 'е'),
      'Відповідно до § 0.0 правопису, усі літери «о» у слові мають мінятися на «е».'
    );
  }
  return null;
});