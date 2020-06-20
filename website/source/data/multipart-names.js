export const multipartNameFormCount = 7;
// This corresponds to the number of elements in the paradigm arrays; the index 0 corresponds to the nominative form

// The "у"/"ю" ending in the locative case should be omitted for nouns, as it is incompatible with other possible
// endings of adjacent words, and at the same time is already covered by the dative case.

export const multipartNameParadigms = [{
  paradigm: ["", "а", ["ові", "у"], "а", "ом", ["і", "ові"], "е"],
  words: [
    "Бім",
    "Володимир",
    "Всеволод",
    "Іван",
    "Ричард",
    "Річард",
    "Степан"
  ]
}, {
  paradigm: ["е", "я", "ю", "е", "ем", "і", "е"],
  words: [
    "Серце"
  ],
}, {
  paradigm: ["о", "а", "у", "о", "ом", "і", "о"],
  words: [
    "Гніздо"
  ]
}, {
  paradigm: ["о", "а", ["у", "ові"], "о", "ом", "у", "о"],
  words: [
    "Сонечко"
  ]
}, {
  paradigm: ["ко", "ка", "ку", "ко", "ком", "ці", "ко"],
  words: [
    "Око"
  ]
}, {
  paradigm: ["хо", "ха", ["ху", "хові"], "хо", "хом", ["сі", "ху"], "хо"],
  words: [
    "Вухо"
  ]
}, {
  paradigm: ["ь", "і", "і", "ь", "ю", "і", "е"],
  words: [
    "Смерть"
  ]
}, {
  paradigm: ["ий", "ого", "ому", "ого", "им", ["ому", "ім"], "ий"],
  words: [
    "Білий"
  ]
}, {
  paradigm: ["е", "ого", "ому", "е", "им", ["ому", "ім"], "е"],
  words: [
    "Велике",
    "Волове",
    "Красне",
    "Левове",
    "Червоне",
    "Чорне"
  ]
}, {
  paradigm: ["а", "ої", "ій", "у", "ою", "ій", "а"],
  words: [
    "Тигрова",
    "Тигряча"
  ]
}];

export const multipartNames = [[
  ["Білий", "Бім"],
  ["Чорне", "Вухо"]
], [
  ["Володимир"],
  [["Красне", "Червоне"], "Сонечко"]
], [
  ["Всеволод"],
  ["Велике", "Гніздо"]
], [
  ["Іван"],
  ["Волове", "Око"]
], [
  [["Ричард", "Річард"]],
  ["Левове", "Серце"]
], [
  ["Степан"],
  [["Тигрова", "Тигряча"], "Смерть"]
]];