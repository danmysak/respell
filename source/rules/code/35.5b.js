import {
  correctionTypes,
  RuleApplication,
  createMaskRule,
  registerWordRule,
  registerPunctuationRule,
  registerWhitespaceRule
} from "../imports.js";

const description = 'Відповідно до § 35 правопису, абревіатуру «ВІЛ-СНІД» слід писати через дефіс.';
const left = 'ВІЛ';
const right = 'СНІД';

function createNonWordRule(condition = (token) => true) {
  return (token, chain) => {
    if (condition(token) && chain.getPreviousToken() === left && (chain.getNextToken() || '').startsWith(right)) {
      return new RuleApplication(correctionTypes.MISTAKE, '-', description);
    } else {
      return null;
    }
  };
}

registerWordRule(createMaskRule({
  matches: [`${left}()${right}*`],
  replacement: "-",
  type: correctionTypes.MISTAKE,
  description
}));

registerPunctuationRule(createNonWordRule((token) => token === '/'));

registerWhitespaceRule(createNonWordRule());