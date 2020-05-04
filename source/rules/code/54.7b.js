import {
  RuleApplication,
  correctionTypes,
  registerWordRule,
  createTreeRule,
  unpackSingleParadigmList,
  determineCase,
  cases,
  capitalize,
  isWhitespace,
  isQuote,
  isAfterSentenceBoundary
} from "../imports.js";
import {websites, websiteTypes} from "../data/websites.js";

const maxTypeDistance = 2; // Type, then possibly wordsAfterType, then possibly an attribute, then the website name
const wordsAfterType = ["для"]; // In lower case
const typePattern = new RegExp(`(${websiteTypes.join('|')})`, 'i');

function findTypeWord(chain, maxDistance) {
  let level = 1;
  while (isQuote(chain.getPreviousToken(level, false))) {
    level++;
  }
  let distance = 0;
  while (true) {
    if (distance === maxDistance) {
      return false;
    }
    const token = chain.getPreviousToken(level, false);
    level++;
    if (isWhitespace(token)) {
      continue;
    }
    if (token === null) {
      return false;
    }
    if (token.match(typePattern)) {
      return true;
    }
    if (distance + 1 !== maxDistance || !wordsAfterType.includes(token.toLowerCase())) {
      distance++;
    }
  }
}

function determineCapitalization(token, chain, typeWordFound) {
  const tokenCase = determineCase(token);
  if (tokenCase === cases.LOWER) {
    if (typeWordFound) {
      return 1;
    }
  } else if (tokenCase === cases.CAPITALIZED) {
    if (!typeWordFound && !isAfterSentenceBoundary(chain)) {
      return -1;
    }
  }
  return 0;
}

function determineQuotes(token, chain, typeWordFound) {
  const hasLeftQuote = isQuote(chain.getPreviousToken(1, false));
  const hasRightQuote = isQuote(chain.getNextToken(1, false));
  if (typeWordFound) {
    return !hasLeftQuote || !hasRightQuote ? 1 : 0;
  } else {
    return hasLeftQuote && hasRightQuote ? -1 : 0;
  }
}

function process(token, chain) {
  const typeWordFound = findTypeWord(chain, maxTypeDistance);
  const capitalization = determineCapitalization(token, chain, typeWordFound);
  const quotes = determineQuotes(token, chain, typeWordFound);
  if (capitalization === 0 && quotes === 0) {
    return null;
  }
  const leftQuote = quotes > 0 ? '«' : '';
  const rightQuote = quotes > 0 ? '»' : '';
  const word = capitalization > 0 ? capitalize(token) : (capitalization < 0 ? token.toLowerCase() : token);
  return new RuleApplication(correctionTypes.UNCERTAIN, `${leftQuote}${word}${rightQuote}`,
    'Відповідно до § 54 правопису, назви сайтів без родового слова («сайт», «мережа» тощо) слід писати з малої букви; '
      + 'із родовим словом — з великої літери та в лапках; ужиті як назви юридичних осіб — з великої букви без лапок.',
    {
      removePreviousToken: quotes < 0,
      removeNextToken: quotes < 0
    }
  );
}

registerWordRule(createTreeRule(
  unpackSingleParadigmList(websites, (form) => [form, process]), null, null,
  {
    lowerCase: true,
    fixApostrophe: true
  })
);