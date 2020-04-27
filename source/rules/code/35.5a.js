import {RuleApplication, correctionTypes, registerWordRule,} from "../imports.js";

const pattern = /^(\d+)(-?)([а-зґє])$/i;

registerWordRule((token) => {
  const match = token.match(pattern);
  if (!match) {
    return null;
  }
  const [_, number, hyphen, letter] = match;
  const replacement = `${number}-${letter.toUpperCase()}`;
  if (replacement === token) {
    return null;
  }
  return new RuleApplication(correctionTypes.MISTAKE, replacement,
    'Відповідно до § 35 правопису, найменування будинків, корпусів тощо слід писати через дефіс у форматі «10-А».'
  );
});