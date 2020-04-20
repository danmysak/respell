import {correctionTypes, TokenChain} from "../spelling/types.js";
import {tokenize} from "../spelling/tokenizer.js";
import {processToken} from "../spelling/processor.js";
import "../rules/rules.js";

const _ = [];

const tests = [
  [2, 'Іч який!', 'Ич який!', correctionTypes.IMPROVEMENT],
  [2, 'А я: «іч, як поважно розкинувся».', 'А я: «ич, як поважно розкинувся».', correctionTypes.IMPROVEMENT],
  [2, 'Птахи відлітають в ірій.', 'Птахи відлітають в ирій.', correctionTypes.IMPROVEMENT],
  [2, 'НЕМАЄ ІРІЮ ПОБЛИЗУ', 'НЕМАЄ ИРІЮ ПОБЛИЗУ', correctionTypes.IMPROVEMENT],
  [2, 'Кожному іроду — по хустинці.', 'Кожному ироду — по хустинці.', correctionTypes.IMPROVEMENT],
  [2, 'Ірод нового часу', 'Ирод нового часу', correctionTypes.IMPROVEMENT],
  [2, 'Різноманітні іродівські штучки вже набридли.', 'Різноманітні иродівські штучки вже набридли.', correctionTypes.IMPROVEMENT],
  [2, 'У Північній Кореї править Кім Чен Ін.', 'У Північній Кореї править Кім Чен Ин.', correctionTypes.MISTAKE],
  [2, 'ОСТАННІЙ ЗАДУМ КІМ ЧЕН ІНА', 'ОСТАННІЙ ЗАДУМ КІМ ЧЕН ИНА', correctionTypes.MISTAKE],
  [_, 'Ін і ян', 'Ін і ян', _],
  [_, 'Це сказав Чен. Інакше тут не вийде.', 'Це сказав Чен. Інакше тут не вийде.', _],
  [_, 'Чен іншого порадити не міг.', 'Чен іншого порадити не міг.', _],

  [6, 'Заїхав якось у горганське село.', 'Заїхав якось у ґорґанське село.', correctionTypes.MISTAKE],
  [6, 'Немає Горган — нема і Карпат', 'Немає Ґорґан — нема і Карпат', correctionTypes.MISTAKE],
  [6, 'У Горонді багато городів!', 'У Ґоронді багато городів!', correctionTypes.MISTAKE],
  [6, 'Без горонд нема і горондівців.', 'Без ґоронд нема і ґорондівців.', [correctionTypes.MISTAKE, correctionTypes.MISTAKE]],
  [6, 'Населений пункт Угля розташований у Карпатах.', 'Населений пункт Уґля розташований у Карпатах.', correctionTypes.MISTAKE],
  [6, 'Чи є щастя в Углі?', 'Чи є щастя в Уґлі?', correctionTypes.MISTAKE],
  [6, 'УГЛЯ — на порятунок!', 'УҐЛЯ — на порятунок!', correctionTypes.MISTAKE],
  [_, 'Він і каже суржиком: що більше угля, то краще.', 'Він і каже суржиком: що більше угля, то краще.', _],
  [6, 'Галятовський він такий.', 'Ґалятовський він такий.', correctionTypes.MISTAKE],
  [6, 'Я читаю Геникову книжку.', 'Я читаю Ґеникову книжку.', correctionTypes.MISTAKE],
  [6, 'Геник', 'Ґеник', correctionTypes.MISTAKE],
  [6, 'ГЕНИКИ-БЕНИКИ ЇЛИ ВАРЕНИКИ', 'ҐЕНИКИ-БЕНИКИ ЇЛИ ВАРЕНИКИ', correctionTypes.MISTAKE],
  [6, 'Герзанич — геній', 'Ґерзанич — геній', correctionTypes.MISTAKE],
  [6, 'Лови Герзанича!', 'Лови Ґерзанича!', correctionTypes.MISTAKE],
  [6, 'Це — Гердан.', 'Це — Ґердан.', correctionTypes.MISTAKE],
  [_, 'Це — гердан.', 'Це — гердан.', _],
  [6, 'Це — гердан Гердана.', 'Це — гердан Ґердана.', correctionTypes.MISTAKE],
  [6, 'Гжицький', 'Ґжицький', correctionTypes.MISTAKE],
  [6, 'Гига Семен', 'Ґиґа Семен', correctionTypes.MISTAKE],
  [6, 'Сімейство Гиг', 'Сімейство Ґиґ', correctionTypes.MISTAKE],
  [6, 'Усе було зроблено за допомогою пана Гоги.', 'Усе було зроблено за допомогою пана Ґоґи.', correctionTypes.UNSURE],
  [6, 'Віддай це Гозі.', 'Віддай це Ґозі.', correctionTypes.UNSURE],
  [6, 'Д. Гойдичу', 'Д. Ґойдичу', correctionTypes.MISTAKE],
  [6, 'Гойдич і компанія', 'Ґойдич і компанія', correctionTypes.MISTAKE],
  [6, 'Скільки Гонт, стільки й думок.', 'Скільки Ґонт, стільки й думок.', correctionTypes.MISTAKE],
  [6, 'Гонта є лише один.', 'Ґонта є лише один.', correctionTypes.MISTAKE],
  [6, 'Не Григами єдиними!', 'Не Ґриґами єдиними!', correctionTypes.MISTAKE],
  [6, 'Один Гула, два Гули, багато Гул', 'Один Ґула, два Ґули, багато Ґул', [correctionTypes.UNSURE, correctionTypes.UNSURE, correctionTypes.UNSURE]],
  [6, 'Ломака захоче — Ломага знайдеться.', 'Ломака захоче — Ломаґа знайдеться.', correctionTypes.MISTAKE],

  [23, 'Знайди лоб у окуня.', 'Знайди лоб в окуня.', correctionTypes.MISTAKE],
  [23, 'Рот у автора великий.', 'Рот в автора великий.', correctionTypes.MISTAKE],
  [23, 'ікс у ігрек', 'ікс в ігрек', correctionTypes.MISTAKE],
  [_, 'Поклав ніж у юрту.', 'Поклав ніж у юрту.', _],
  [23, 'Найкращий курс — у НБУ', 'Найкращий курс — в НБУ', correctionTypes.MISTAKE],
  [23, 'У АВС немає претензій.', 'В АВС немає претензій.', correctionTypes.MISTAKE],
  [23, 'Гроші вклав у МОТ.', 'Гроші вклав в МОТ.', correctionTypes.MISTAKE],
  [_, 'Гроші вклав у Мот.', 'Гроші вклав у Мот.', _],
  [_, 'Гроші вклав у КОТ.', 'Гроші вклав у КОТ.', _],
  [_, 'у', 'у', _]
];

let succeeded = 0;
let failed = 0;

tests.forEach(([sections, text, corrected, types]) => {
  const tokens = tokenize(text);
  const replaced = [];
  const chain = new TokenChain(tokens);
  const encounteredTypes = [];
  const encounteredDescriptions = [];
  while (chain.hasMore()) {
    chain.next();
    const application = processToken(chain);
    if (application === null) {
      replaced.push(chain.getCurrentToken());
    } else {
      replaced.push(application.replacement);
      encounteredTypes.push(application.type);
      encounteredDescriptions.push(...application.descriptions);
    }
  }
  const final = replaced.join('');
  const errors = [];
  if (final !== corrected) {
    errors.push(`Results differ: "${final}" instead of expected "${corrected}"`);
  }
  const expectedTypes = (Array.isArray(types) ? types : [types]).join(',');
  const actualTypes = encounteredTypes.join(',');
  if (actualTypes !== expectedTypes) {
    errors.push(`Types differ: "${actualTypes}" instead of expected "${expectedTypes}"`);
  }
  const actualDescriptions = encounteredDescriptions.join('; ');
  (Array.isArray(sections) ? sections : [sections]).forEach((section) => {
    if (!actualDescriptions.match(new RegExp(`§\\s*${section}(?!\d)`))) {
      errors.push(`Section "${section}" not found in descriptions "${actualDescriptions}"`);
    }
  });
  if (errors.length === 0) {
    succeeded++;
  } else {
    console.error(`Test "${text}" failed:`, ...errors);
    failed++;
  }
});

console.log(`Done running ${tests.length} tests: ${succeeded} succeeded, ${failed} failed`);