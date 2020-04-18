import {registerWordRule} from "../spellcheck/storage.js";
import {correctionTypes, RuleApplication} from "../spellcheck/spellchecker.js";

registerWordRule((token) => {
  if (token.includes('р')) {
    return new RuleApplication(correctionTypes.UNSURE, token.replace(/р/g, ''),
      'Відповідно до § 0.2 правопису, усі літери «р» у слові, можливо, видаляються.'
    );
  }
  return null;
});