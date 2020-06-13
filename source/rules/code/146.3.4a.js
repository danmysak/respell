import {correctionTypes, registerWordRule, labels, createMaskRule, isCapitalized, getVowels} from "../imports.js";

const pattern = new RegExp(`^(.{3,}|.[^${getVowels(true).join('')}])(огли|заде|кизи|бе.+|хан.*)$`, 'i');

const beyEndings = ["єві", "єм", "ї", "їв", "й", "ю", "я", "ям", "ями", "ях"];
const khanEndings = ["", "а", "ам", "ами", "ах", "е", "и", "і", "ів", "ові", "ом", "у"];

registerWordRule(createMaskRule({
  callback: (token) => !token.includes('-') && isCapitalized(token) && token.match(pattern),
  rules: [{
    matches: ["+()огли"],
    antiMatches: [
      [["", "з", "зне", "пере", "під", "*по"], "могли"],
      "*щогли"
    ],
  }, {
    matches: ["+()заде"],
    antiMatches: ["*озаде"] // "широкозаде", "вислозаде", etc.
  }, {
    matches: ["+()кизи"],
    antiMatches: ["лакизи"]
  }, {
    matches: [
      ["+()бе", beyEndings]
    ],
    antiMatches: [
      [["", "Беле", "бом", "Воро", "Кочу", "*пле", "*скара", "Тай", "Хе", "Ху", "Юри"], "бе", beyEndings],
      [["До", "Ев"], "бе", ["ї", "ю", "я"]],
      "Зейнабей"
    ]
  }, {
    matches: [
      ["+()хан", khanEndings]
    ],
    antiMatches: [
      [["", "бар", "бу", "ду", "прочу", "тар", "тру", "*чингіс", "*чинґіс"], "хан", khanEndings],
      [["Астра", "Ти"], "хан", ["е", "і"]],
      [["Пле", "Про", "Ста"], "хан", ["ові"]],
      [["*ру", "*сли"], "хан", ["а", "е", "і", "у"]],
      [["чай"], "хан", ["", "а", "ам", "ами", "ах", "и", "і", "у"]],
      [["", "в", "гл"], "ухан", ["і", "ів"]],
      [[
        "*бре", "*брі", "*брьо", "*бур", "*вип", "*віп", "*ди", "*дму", "*жа", "*ко", "*коли", "*ма",
        "*ню", "*па", "*пана", "*пи", "*пир", "*поло", "*про", "*слу", "*стра", "*чу", "*штов", "*штур"
      ], "хан*"],
      [["", "за", "на", "пере", "при", "про", "роз", "розі"], "", ["вихан*", "їхан*", "нехан*", "пхан*", "чімхан*"]]
    ]
  }],
  replacement: "-",
  type: correctionTypes.UNCERTAIN,
  description: 'Відповідно до § 146 правопису, східні імена (але не прізвища) з кінцевими компонентами '
    + '«огли», «заде», «кизи», «бей», «хан» слід писати з рештою імені через дефіс із малої літери '
    + '(за винятком імені Чингісхана).'
}), [labels.FOREIGN_NAMES]);