import {registerWordRule} from "../spellcheck/storage.js";
import {correctionTypes, RuleApplication} from "../spellcheck/spellchecker.js";

registerWordRule((token) => {
  if (token.includes('а')) {
    return new RuleApplication(correctionTypes.IMPROVEMENT, token.replace(/а/g, 'и'),
      'Відповідно до § 0.0 правопису, усі літери «а» можуть мінятися на «и».'
    );
  }
  return null;
});