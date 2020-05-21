const extraFeminineVocative = [
  "бізнеследі", "бізнес-леді",
  "леді",
  "мадам",
  "мадемуазель",
  "міледі",
  "міс",
  "місіс",
  "місис",
  "пані",
  "фрау",
  "фрейлейн",
  "фройляйн",
  "фрекен",
  "ханум"
];

const minFeminineTitleLength = 4;

export const feminine = {
  adjectivePattern: /[ая]$/i,
  vocativePattern: new RegExp(`([еєо]|сю|^(${extraFeminineVocative.join('|')}))$`, 'i'),
  minTitleLength: minFeminineTitleLength,
  shorterTitles: extraFeminineVocative.filter((title) => title.length < minFeminineTitleLength),
  endings: {
    "а": {
      "о": null,
      "е": ["ж", "ч", "ш"]
    },
    "я": {
      "е": null,
      "є": ["а", "е", "є", "и", "і", "ї", "о", "у", "ь", "ю", "я", "'"],
      "ю": ["с"]
    },
  }
};

const extraMasculineVocative = [{
  wholeWord: true,
  ending: "",
  preceding: [
    "гер",
    "сер",
    "сір"
  ]
}, {
  wholeWord: false,
  ending: "о",
  preceding: [
    "батюшк",
    "верховод",
    "вид",
    "вискочк",
    "вишибал",
    "голов",
    "гульвіс",
    "ґазд",
    "далай-лам",
    "дотеп",
    "дядюшк",
    "жер",
    "задир",
    "зануд",
    "здар",
    "знайк",
    "мерзот",
    "нахаб",
    "незграб",
    "непосид",
    "нероб",
    "нечем",
    "нечепур",
    "нишпорк",
    "нікчем",
    "одиночк",
    "паїньк",
    "підлабуз",
    "підлиз",
    "приблуд",
    "причеп",
    "пройд",
    "пролаз",
    "пронир",
    "псяр",
    "рибалк",
    "роззяв",
    "розтяп",
    "самоучк",
    "сирот",
    "скнар",
    "скнир",
    "собацюр",
    "старост",
    "тамад",
    "шульг",
    "ябед"
  ]
}];

const minMasculineTitleLength = 4;

export const masculine = {
  adjectivePattern: /[иії]й$/i,
  vocativePattern: new RegExp('(е|ю|[гґжкхчшщ]у|([аеєиіїоуюя][гкх]|о(нь|ч)к|ин)о' + extraMasculineVocative.map(
    ({wholeWord, ending, preceding}) => `|${wholeWord ? '^' : ''}(${preceding.join('|')})${ending}`
  ).join('') + ')$', 'i'),
  minTitleLength: minMasculineTitleLength,
  shorterTitles: extraMasculineVocative
    .flatMap(({wholeWord, ending, preceding}) => wholeWord ? preceding.map((stem) => stem + ending) : [])
    .filter((title) => title.length < minMasculineTitleLength),
  endings: {
    "б": "бе",
    "в": "ве",
    "г": ["гу", "же"],
    "ґ": "ґу",
    "д": "де",
    "ж": ["же", "жу"],
    "з": "зе",
    "й": "ю",
    "к": ["ку", "че"],
    "л": "ле",
    "м": "ме",
    "н": "не",
    "п": "пе",
    "р": ["ре", "рю"],
    "с": "се",
    "т": "те",
    "ф": "фе",
    "х": ["ху", "ше"],
    "ц": "це",
    "ч": "чу",
    "ш": ["шу", "ше"],
    "щ": "щу",
    "ь": "ю"
  },
  specificLastNameEndings: {
    "а": "о",
    "г": "гу",
    "к": "ку",
    "о": "у",
    "х": "ху"
  },
  lastNameRequirements: {
    "о": /ко$/,
    "м": /^(?!Вам$)/,
    "с": /^(?!Вас$)/
  },
  excludedEndings: [
    "ам",
    "ей",
    "ем",
    "єм",
    "ив",
    "ий",
    "им",
    "инь",
    "ить",
    "иць",
    "иш",
    "ів",
    // "ій", There are quite a few non-adjectival nouns ending in "ій", so we have to accept some false positives
    "ість",
    "іть",
    "іч",
    "їв",
    "їй",
    "їть",
    "їш",
    "ой",
    "ок",
    "ом",
    "сь",
    "тимеш",
    "тимуть",
    "ям",
    "ям",
    "ять"
  ]
};