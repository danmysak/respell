import {correctionTypes, registerWordRule, createMaskRule, isWord} from "../imports.js";

const numeratorPattern = /^(дві|три|чотири)$/i;
const middlePattern = /^(двадцять|тридцять|сорок|.*десят|дев['’]яносто|сто|двісті|.*риста|.*тсот|.*сімсот|тисяча)$/i;
const onePattern = /^перші$/i
const maxNumeratorDistance = 4;

registerWordRule(createMaskRule({
  rules: [{
    matches: [
      [[
        "перш", "друг", "четверт", "п'ят", "шост", "сьом", "восьм", "дев'ят", "*десят", "*дцят", "сороков", "дев'яност",
        "сот", "*охсот", "*тисот", "*мисот", "*тисячн", "*мільйонн", "*мільярдн", "*трильйонн", "*трильярдн"
      ], "(і)"]
    ],
    replacement: "их"
  }, {
    matches: ["трет(і)"],
    replacement: "іх"
  }],
  callback: (token, chain) => {
    for (let level = 1; level <= maxNumeratorDistance; level++) {
      const currentToken = chain.getPreviousToken(level);
      if (currentToken === null || !isWord(currentToken)) {
        return false;
      }
      if (currentToken.match(middlePattern)) {
        continue;
      }
      return currentToken.match(numeratorPattern) && (level > 1 || !token.match(onePattern));
    }
    return false;
  },
  type: correctionTypes.UNCERTAIN,
  description: 'Відповідно до § 107 правопису, знаменники дробів із числівниками з компонентами «дві», «три», «чотири» '
    + 'мають закінчення «-их»/«-іх» («дві третіх» замість «дві треті», «чотири сьомих» замість «чотири сьомі»).'
}));