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
  [23, 'Страшенний біль у очах.', 'Страшенний біль в очах.', correctionTypes.MISTAKE],
  [23, 'Рот у авторки великий.', 'Рот в авторки великий.', correctionTypes.MISTAKE],
  [23, 'ікс у ігрек', 'ікс в ігрек', correctionTypes.MISTAKE],
  [_, 'Поклав ніж у юрту.', 'Поклав ніж у юрту.', _],
  [23, 'Найкращий курс — у НБУ', 'Найкращий курс — в НБУ', correctionTypes.MISTAKE],
  [23, 'У АВС немає претензій.', 'В АВС немає претензій.', correctionTypes.MISTAKE],
  [23, 'Ура! У АВС немає претензій.', 'Ура! В АВС немає претензій.', correctionTypes.MISTAKE],
  [23, 'Гроші вклав у МОТ.', 'Гроші вклав в МОТ.', correctionTypes.MISTAKE],
  [_, 'Гроші вклав у Мот.', 'Гроші вклав у Мот.', _],
  [_, 'Гроші вклав у КОТ.', 'Гроші вклав у КОТ.', _],
  [_, 'у', 'у', _],

  [24, 'Чай й молоко', 'Чай та молоко', correctionTypes.MISTAKE],
  [24, 'Я Й ТИ', 'Я ТА ТИ', correctionTypes.MISTAKE],
  [24, 'Не знаю й', 'Не знаю та', correctionTypes.MISTAKE],
  [24, 'Знає й тікає', 'Знає та тікає', correctionTypes.MISTAKE],
  [24, 'Її й його', 'Її та його', correctionTypes.MISTAKE],
  [_, 'І її, й його', 'І її, й його', _],
  [_, 'й що?', 'й що?', _],
  [_, 'так. й що?', 'так. й що?', _],
  [_, 'Ну й от!', 'Ну й от!', _],

  [25, 'З заводу приніс чоботи.', 'Із заводу приніс чоботи.', correctionTypes.MISTAKE],
  [25, 'Звідки питимеш? З цистерни.', 'Звідки питимеш? Із цистерни.', correctionTypes.MISTAKE],
  [25, 'Довго вибирала з двох кольорів. З чорного і білого.', 'Довго вибирала з двох кольорів. Із чорного і білого.', correctionTypes.MISTAKE],
  [25, 'Гарно списав! З щоденника', 'Гарно списав! Із щоденника', correctionTypes.MISTAKE],
  [_, 'Гарно списав з щоденника', 'Гарно списав з щоденника', _],
  [_, 'Гарно списав З ЧИСТОВИКА', 'Гарно списав З ЧИСТОВИКА', _],
  [_, 'З лівої шкарпетки.', 'З лівої шкарпетки.', _],
  [25, 'Виліз із обруча.', 'Виліз з обруча.', correctionTypes.MISTAKE],
  [25, 'цей ваш із Авдіївки', 'цей ваш з Авдіївки', correctionTypes.MISTAKE],
  [25, 'І палац із усіх найкращих будівельних матеріалів...', 'І палац з усіх найкращих будівельних матеріалів...', correctionTypes.MISTAKE],
  [25, 'Палець із однієї з рук', 'Палець з однієї з рук', correctionTypes.MISTAKE],
  [_, 'крик із остраху', 'крик із остраху', _],
  [_, 'НІЖ ІЗ ЗАЛІЗА', 'НІЖ ІЗ ЗАЛІЗА', _],
  [_, 'Корж із оновленого тіста?', 'Корж із оновленого тіста?', _],
  [_, 'мопс із орбіти', 'мопс із орбіти', _],

  [29, 'Побачив священик священика — і освятився.', 'Побачив священник священника — і освятився.', [correctionTypes.MISTAKE, correctionTypes.MISTAKE]],
  [29, 'Священиків ліхтар найяскравіший.', 'Священників ліхтар найяскравіший.', correctionTypes.MISTAKE],
  [29, 'СВЯЩЕНИЦЬКИЙ ДОСВІД', 'СВЯЩЕННИЦЬКИЙ ДОСВІД', correctionTypes.MISTAKE],
  [_, 'Побачив священний текст у книзі.', 'Побачив священний текст у книзі.', _],

  [31, 'Побачив архієрея за дверима.', 'Побачив архиєрея за дверима.', correctionTypes.IMPROVEMENT],
  [31, 'Архідиякон кращий за просто дияконесу.', 'Архидиякон кращий за просто дияконесу.', correctionTypes.IMPROVEMENT],
  [31, 'АРХІМАНДРИТСТВО', 'АРХИМАНДРИТСТВО', correctionTypes.IMPROVEMENT],
  [31, 'Чудовий архістратизький задум', 'Чудовий архистратизький задум', correctionTypes.IMPROVEMENT],
  [31, 'Архієпархи проти архієпископів', 'Архиєпархи проти архиєпископів', [correctionTypes.IMPROVEMENT, correctionTypes.IMPROVEMENT]],
  [_, 'Треба побувати на тому архіпелазі.', 'Треба побувати на тому архіпелазі.', _],
  [_, 'Архів', 'Архів', _],

  [32, 'Не бачив таких марев з дитинства.', 'Не бачив таких марив з дитинства.', correctionTypes.MISTAKE],
  [32, 'МАРЕВО', 'МАРИВО', correctionTypes.MISTAKE],
  [32, 'І в маревному сні не насниться!', 'І в маривному сні не насниться!', correctionTypes.MISTAKE],

  [32, 'Багато упорядників!', 'Багато упорядниць!', correctionTypes.UNSURE, true], /* банник-банниця */
  [32, 'Що це значить — бути кур’єром?', 'Що це значить — бути кур’єркою?', correctionTypes.UNSURE, true], /* ант-антка */
  [32, 'Що це значить — бути ексчемпіоном?', 'Що це значить — бути ексчемпіонкою?', correctionTypes.UNSURE, true], /* ант-антка */
  [32, 'НОВОЗЕЛАНДЦІ', 'НОВОЗЕЛАНДКИ', correctionTypes.UNSURE, true], /* бранець-бранка */
  [32, 'У розповідача багато розповідей', 'У розповідачки багато розповідей', correctionTypes.UNSURE, true], /* читач-читачка */
  [32, 'Городяни в селі', 'Городянки в селі', correctionTypes.UNSURE, true], /* киянин-киянка */
  [32, 'сердюком не народжуються', 'сердючкою не народжуються', correctionTypes.UNSURE, true], /* вояк-воячка */
  [32, 'Примирителем по примирителю', 'Примирителькою по примирительці', [correctionTypes.UNSURE, correctionTypes.UNSURE], true], /* житель-жителька */
  [32, 'Нема воротарів', 'Нема воротарок', correctionTypes.UNSURE, true], /* бідар-бідарка */
  [32, 'сотниками', 'сотничками', correctionTypes.UNSURE, true], /* кумик-кумичка */
  [32, 'Усе ласіям', 'Усе ласійкам', correctionTypes.UNSURE, true], /* буржуй-буржуйка */
  [32, 'Зі здирщиками не розмовлятиму.', 'Зі здирщицями не розмовлятиму.', correctionTypes.UNSURE, true], /* банщик-банщиця */
  [32, 'без щасливця...', 'без щасливиці...', correctionTypes.UNSURE, true], /* обранець-обраниця */
  [32, 'Арф\'яру — арфу.', 'Арф’ярці — арфу.', correctionTypes.UNSURE, true], /* дояр-доярка */
  [32, 'Сейшели сейшельцям', 'Сейшели сейшелкам', correctionTypes.UNSURE, true], /* агулець-агулка */
  [32, 'латишеві Латвію', 'латишці Латвію', correctionTypes.UNSURE, true], /* діяч-діячка */
  [32, 'Море шалапутників', 'Море шалапуток', correctionTypes.UNSURE, true], /* шалапутник-шалапутка */
  [32, 'ТУТ Є ВМІЛЕЦЬ', 'ТУТ Є ВМІЛИЦЯ', correctionTypes.UNSURE, true], /* умілець-умілиця */
  [32, 'по бісах', 'по бісицях', correctionTypes.UNSURE, true], /* біс-бісиця */
  [32, 'На автомандрівниках велика відповідальність.', 'На автомандрівницях велика відповідальність.', correctionTypes.UNSURE, true], /* витівник-витівниця */
  [32, 'Не герцогами єдиними.', 'Не герцогинями єдиними.', correctionTypes.UNSURE, true], /* герцог-герцогиня */
  [32, 'Це патронів?!', 'Це патронес?!', correctionTypes.UNSURE, true], /* поет-поетеса */
  [32, 'Віддам партизанові.', 'Віддам партизанці.', correctionTypes.UNSURE, true], /* циган-циганка */
  [32, 'належить шефові', 'належить шефині', correctionTypes.UNSURE, true], /* раб-рабиня */
  [32, 'багатирях', 'багатирках', correctionTypes.UNSURE, true], /* багатир-багатирка */
  [32, 'Зараз лях - це поляк.', 'Зараз ляшка - це полячка.', [correctionTypes.UNSURE, correctionTypes.UNSURE], true], /* монах-монашка+ */
  [32, 'казаха тут не бачив', 'казашки тут не бачив', correctionTypes.UNSURE, true], /* чех-чешка */
  [32, 'Ах ти, вертихвосте!', 'Ах ти, вертихвістко!', correctionTypes.UNSURE, true], /* вертихвіст-вертихвістка */
  [32, 'Моїм співучням присвячується', 'Моїм співученицям присвячується', correctionTypes.UNSURE, true], /* учень-учениця */
  [32, 'І лемку, і всім', 'І лемкині, і всім', correctionTypes.UNSURE, true], /* бойко-бойкиня */
  [32, 'Треба помолитися богу.', 'Треба помолитися богині.', correctionTypes.UNSURE, true], /* бог-богиня */
  [32, 'Це — критик.', 'Це — критикеса.', correctionTypes.UNSURE, true], /* критик-критикеса */
  [32, 'Що там із моїми голубками?', 'Що там із моїми голубочками?', correctionTypes.UNSURE, true], /* голубок-голубочка */
  [32, 'Тут навчаються консьєржі', 'Тут навчаються консьєржки', correctionTypes.UNSURE, true], /* консьєрж-консьєржка */
  [32, 'Не застав КУРКУЛІВ', 'Не застав КУРКУЛЬОК', correctionTypes.UNSURE, true], /* куркуль-куркулька */
  [32, 'Маляре, ти де?', 'Малярко, ти де?', correctionTypes.UNSURE, true], /* маляр-малярка */
  [32, 'угринові', 'угринці', correctionTypes.UNSURE, true], /* угрин-угринка */
  [32, 'Ви, шапсуже, помиляєтеся.', 'Ви, шапсужко, помиляєтеся.', correctionTypes.UNSURE, true], /* шапсуг-шапсужка */
  [32, 'Жерці їдять', 'Жриці їдять', correctionTypes.UNSURE, true], /* жрець-жриця */
  [32, 'боярине, ну-бо', 'боярине, ну-бо', correctionTypes.UNSURE, true], /* боярин-бояриня */
  [32, 'У государях', 'У государинях', correctionTypes.UNSURE, true], /* государ-государиня */
  [32, 'Дайте сюди ґазду!', 'Дайте сюди ґаздиню!', correctionTypes.UNSURE, true], /* ґазда-ґаздиня */
  [32, 'Майстрів теж сюди.', 'Майстринь теж сюди.', correctionTypes.UNSURE, true], /* майстер-майстриня */
  [32, 'Царі мудрі.', 'Цариці мудрі.', correctionTypes.UNSURE, true], /* цар-цариця */
  [32, 'Віддамо все ченцям, так.', 'Віддамо все черницям, так.', correctionTypes.UNSURE, true], /* чернець-черниця */

  [32, 'Віктор Ігорович Чернай', 'Віктор Ігорьович Чернай', correctionTypes.MISTAKE],
  [32, 'Ігоровича бачив?', 'Ігорьовича бачив?', correctionTypes.MISTAKE],
  [32, 'Цей — ІГОРОВИЧІВСЬКИЙ.', 'Цей — ІГОРЬОВИЧІВСЬКИЙ.', correctionTypes.MISTAKE],
  [32, 'Ігоревич', 'Ігорьович', correctionTypes.MISTAKE],
  [32, 'Петру Ігоревичеві', 'Петру Ігорьовичеві', correctionTypes.MISTAKE],
  [_, 'А де Ігор?', 'А де Ігор?', _],

  [32, 'На дворі багато необільшовизму.', 'На дворі багато необільшовізму.', correctionTypes.MISTAKE],
  [32, 'Більшовизм', 'Більшовізм', correctionTypes.MISTAKE],
  [32, 'Кожен боротьбист має знати своє місце.', 'Кожен боротьбіст має знати своє місце.', correctionTypes.MISTAKE],
  [32, 'Побутовисти — джерело зла.', 'Побутовісти — джерело зла.', correctionTypes.MISTAKE],
  [32, 'МЕНШОВИЗМИ', 'МЕНШОВІЗМИ', correctionTypes.MISTAKE],

  [35, 'стодвохактна вистава', 'стодвоактна вистава', correctionTypes.MISTAKE],
  [35, 'Великий двохелектрод', 'Великий двоелектрод', correctionTypes.MISTAKE],
  [35, 'ДВОХОКСИД', 'ДВООКСИД', correctionTypes.MISTAKE],
  [35, 'Остання двохтижнева відпустка.', 'Остання двотижнева відпустка.', correctionTypes.MISTAKE],
  [35, 'Двох\'ярусний', 'Двоярусний', correctionTypes.MISTAKE],
  [_, 'Посиділи удвох', 'Посиділи удвох', _],
  [_, 'Двохвилинна виставка', 'Двохвилинна виставка', _],
  [_, 'Стодвохвилинна вистава', 'Стодвохвилинна вистава', _],
  [_, 'Це — двохвіст', 'Це — двохвіст', _],
  [_, 'Якщо когось облити двохромовокислою сумішшю, він цього не зрозуміє.', 'Якщо когось облити двохромовокислою сумішшю, він цього не зрозуміє.', _],
  [_, 'У двохтисячному році настало нове тисячоліття.', 'У двохтисячному році настало нове тисячоліття.', _],
  [35, 'трьохатомність', 'триатомність', correctionTypes.MISTAKE],
  [35, 'Що таке трьохокисень?', 'Що таке триокисень?', correctionTypes.MISTAKE],
  [35, 'Вау! Тисячатрьохкілометрова черга.', 'Вау! Тисячатрикілометрова черга.', correctionTypes.MISTAKE],
  [35, 'Я зустріла трьох’єству істоту...', 'Я зустріла триєству істоту...', correctionTypes.MISTAKE],
  [_, 'Ви наша трьохмільйонна відвідувачка!', 'Ви наша трьохмільйонна відвідувачка!', _],
  [_, 'трильярдний борг', 'трильярдний борг', _],
  [_, 'стотрьохтрильярдний борг', 'стотрьохтрильярдний борг', _],
  [35, 'Чотирьохосьова клавіатура', 'Чотириосьова клавіатура', correctionTypes.MISTAKE],
  [35, 'Намалюй мільйонтисячасточотирьохкутник!', 'Намалюй мільйонтисячасточотирикутник!', correctionTypes.MISTAKE],
  [_, 'Чи знаєш ти тих чотирьох?', 'Чи знаєш ти тих чотирьох?', _],
  [_, 'вчотирьохно', 'вчотирьохно', _],
  [_, 'У чотирьохсотому випадку', 'У чотирьохсотому випадку', _],
  [_, 'Чотирьохмільярдний раз', 'Чотирьохмільярдний раз', _],
  [_, 'ЧОТИРЬОХТРИЛЬЙОННА КІЛЬКІСТЬ', 'ЧОТИРЬОХТРИЛЬЙОННА КІЛЬКІСТЬ', _],

  [35, 'Слід пройти фотохіміотерапію.', 'Слід пройти фотохімієтерапію.', correctionTypes.IMPROVEMENT],
  [35, 'Хіміопрепарат цей дуже потужний.', 'Хімієпрепарат цей дуже потужний.', correctionTypes.IMPROVEMENT],
  [35, 'ІСТОРІОТВОРЧА ІНІЦІАТИВА', 'ІСТОРІЄТВОРЧА ІНІЦІАТИВА', correctionTypes.IMPROVEMENT],
  [35, 'Націотвірний механізм', 'Націєтвірний механізм', correctionTypes.IMPROVEMENT],
  [35, 'Хтось захопився націознавством.', 'Хтось захопився націєзнавством.', correctionTypes.IMPROVEMENT],
  [35, 'Не бачив ще такого підступного бактеріоносія!', 'Не бачив ще такого підступного бактерієносія!', correctionTypes.IMPROVEMENT],
  [35, 'Це все бактеріовловлювацькі штучки...', 'Це все бактерієвловлювацькі штучки...', correctionTypes.IMPROVEMENT],
  [35, 'Артеріовенозні препарати', 'Артерієвенозні препарати', correctionTypes.IMPROVEMENT],
  [_, 'Підручник з бактеріології', 'Підручник з бактеріології', _],
  [_, 'Націогенний механізм', 'Націогенний механізм', _],
  [_, 'Що таке хіміотаксис?', 'Що таке хіміотаксис?', _],

  [35, 'Багат-вечори року', 'Багатвечори року', correctionTypes.MISTAKE],
  [35, 'Прийти на багат-вечір ще нічого не значить.', 'Прийти на багатвечір ще нічого не значить.', correctionTypes.MISTAKE],
  [35, 'БАГАТ-ВЕЧІРНЄ БАГАТТЯ', 'БАГАТВЕЧІРНЄ БАГАТТЯ', correctionTypes.MISTAKE],
  [_, 'Ранки-вечори', 'Ранки-вечори', _],

  [35, 'Зайшов до арт-студії.', 'Зайшов до артстудії.', correctionTypes.MISTAKE],
  [35, 'Бліц-опитування', 'Бліцопитування', correctionTypes.MISTAKE],
  [35, 'Веб-сторінка університету', 'Вебсторінка університету', correctionTypes.MISTAKE],
  [35, 'віце-прем’єр-міністр', 'віцепрем’єр-міністр', correctionTypes.MISTAKE],
  [35, 'Віце-прем\'єр-міністр', 'Віцепрем\'єр-міністр', correctionTypes.MISTAKE],
  [35, 'Оце економ-клас?', 'Оце економклас?', correctionTypes.MISTAKE],
  [35, 'Це медаль екс-чемпіона!', 'Це медаль ексчемпіона!', correctionTypes.MISTAKE],
  [35, 'Пісню виконав фолк-гурт.', 'Пісню виконав фолкгурт.', correctionTypes.MISTAKE],
  [35, 'Штабс-капітанська квартира :-)', 'Штабскапітанська квартира :-)', correctionTypes.MISTAKE],
  [35, 'Усі ходять або в максі-одязі, або в міні-спідницях.', 'Усі ходять або в максіодязі, або в мініспідницях.', [correctionTypes.MISTAKE, correctionTypes.MISTAKE]],
  [35, 'КІБЕР-ЗЛОЧИНЕЦЬ', 'КІБЕРЗЛОЧИНЕЦЬ', correctionTypes.UNSURE],
  [35, 'У пошуках КОНТР-АДМІРАЛ-ІНЖЕНЕРА', 'У пошуках КОНТРАДМІРАЛ-ІНЖЕНЕРА', correctionTypes.UNSURE],
  [35, 'Придбав собі міні-ЕОМ.', 'Придбав собі мініЕОМ.', correctionTypes.UNSURE],
  [_, 'усі, хто проживав на території екс-Югославії', 'усі, хто проживав на території екс-Югославії', _],
  [_, 'Поп-Європа проти рок-Америки', 'Поп-Європа проти рок-Америки', _],
  [_, 'Добре артикулювати важливо.', 'Добре артикулювати важливо.', _],
  [_, 'Префікси арт- та інші пишемо зі словом разом.', 'Префікси арт- та інші пишемо зі словом разом.', _],
];

let succeeded = 0;
let failed = 0;

tests.forEach(([sections, text, corrected, types, extraChange]) => {
  extraChange = extraChange || false;
  const tokens = tokenize(text);
  const replaced = [];
  const chain = new TokenChain(tokens);
  const encounteredTypes = [];
  const encounteredDescriptions = [];
  let encounteredExtraChange = false;
  while (chain.hasMore()) {
    chain.next();
    const application = processToken(chain);
    if (application === null) {
      replaced.push(chain.getCurrentToken());
    } else {
      replaced.push(application.replacement);
      encounteredExtraChange = encounteredExtraChange || application.requiresExtraChange;
      encounteredTypes.push(application.type);
      encounteredDescriptions.push(...application.descriptions);
    }
  }
  const final = replaced.join('');
  const errors = [];
  if (final !== corrected) {
    errors.push(`Results differ: "${final}" instead of expected "${corrected}"`);
  }
  if (encounteredExtraChange !== extraChange) {
    errors.push(`Extra change is ${encounteredExtraChange ? 'required' : 'not required'}, but expected otherwise`);
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