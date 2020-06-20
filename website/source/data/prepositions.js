import {cases, frequency} from "../includes/grammar.js";

// Multipart prepositions (such as "з допомогою" or "під час") as well as words that are more frequently
// used as other parts of speech ("коло", "край", "круг", "кругом", "просто") are left out.

export const prepositions = {
  "без": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "біля": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "близько": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "в": {
    [cases.GENITIVE]: frequency.FREQUENT,
    [cases.ACCUSATIVE]: frequency.FREQUENT,
    [cases.LOCATIVE]: frequency.FREQUENT
  },
  "вві": {
    [cases.LOCATIVE]: frequency.FREQUENT
  },
  "вглиб": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "взамін": {
    [cases.GENITIVE]: frequency.FREQUENT,
    [cases.DATIVE]: frequency.FREQUENT
  },
  "вздовж": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "від": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "відносно": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "внаслідок": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "впродовж": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "всередині": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "всередину": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "вслід": {
    [cases.DATIVE]: frequency.FREQUENT
  },
  "всупереч": {
    [cases.DATIVE]: frequency.FREQUENT
  },
  "для": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "до": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "довкола": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "довкруги": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "з": {
    [cases.GENITIVE]: frequency.FREQUENT,
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "з-за": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "з-над": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "з-під": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "з-поміж": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "за": {
    [cases.GENITIVE]: frequency.FREQUENT,
    [cases.ACCUSATIVE]: frequency.FREQUENT,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "завдяки": {
    [cases.DATIVE]: frequency.FREQUENT
  },
  "задля": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "замість": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "заради": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "зверх": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "зі": {
    [cases.GENITIVE]: frequency.FREQUENT,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "зо": {
    [cases.ACCUSATIVE]: frequency.FREQUENT,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "із": {
    [cases.GENITIVE]: frequency.FREQUENT,
    [cases.ACCUSATIVE]: frequency.FREQUENT,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "ізсередини": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "крізь": {
    [cases.ACCUSATIVE]: frequency.FREQUENT
  },
  "крім": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "межи": {
    [cases.GENITIVE]: frequency.UNCOMMON,
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "між": {
    [cases.GENITIVE]: frequency.UNCOMMON,
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "на": {
    [cases.ACCUSATIVE]: frequency.FREQUENT,
    [cases.LOCATIVE]: frequency.FREQUENT
  },
  "навздогін": {
    [cases.DATIVE]: frequency.FREQUENT
  },
  "навколо": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "навкруг": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "навперейми": {
    [cases.DATIVE]: frequency.FREQUENT
  },
  "навпроти": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "над": {
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "наді": {
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "надо": {
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "назустріч": {
    [cases.DATIVE]: frequency.FREQUENT
  },
  "напереріз": {
    [cases.DATIVE]: frequency.FREQUENT
  },
  "неподалік": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "о": {
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.LOCATIVE]: frequency.FREQUENT
  },
  "об": {
    [cases.ACCUSATIVE]: frequency.FREQUENT,
    [cases.LOCATIVE]: frequency.FREQUENT
  },
  "обабіч": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "обік": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "од": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "окрім": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "опісля": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "опріч": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "перед": {
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "передо": {
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "під": {
    [cases.ACCUSATIVE]: frequency.FREQUENT,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "піді": {
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "підо": {
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "після": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "по": {
    [cases.DATIVE]: frequency.UNCOMMON,
    [cases.ACCUSATIVE]: frequency.FREQUENT,
    [cases.LOCATIVE]: frequency.FREQUENT
  },
  "побік": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "побіля": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "побіч": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "поблизу": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "поверх": {
    [cases.GENITIVE]: frequency.FREQUENT,
    [cases.ACCUSATIVE]: frequency.UNCOMMON
  },
  "повз": {
    [cases.ACCUSATIVE]: frequency.FREQUENT
  },
  "поза": {
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "позад": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "позаду": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "помежи": {
    [cases.GENITIVE]: frequency.UNCOMMON,
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "поміж": {
    [cases.GENITIVE]: frequency.UNCOMMON,
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "понад": {
    [cases.ACCUSATIVE]: frequency.FREQUENT,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "поперед": {
    [cases.GENITIVE]: frequency.FREQUENT,
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.INSTRUMENTAL]: frequency.UNCOMMON
  },
  "попереду": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "поперек": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "попід": {
    [cases.ACCUSATIVE]: frequency.FREQUENT,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "попри": {
    [cases.GENITIVE]: frequency.UNCOMMON,
    [cases.ACCUSATIVE]: frequency.FREQUENT,
    [cases.LOCATIVE]: frequency.UNCOMMON
  },
  "посеред": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "посередині": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "пред": {
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "преді": {
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "предо": {
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "при": {
    [cases.LOCATIVE]: frequency.FREQUENT
  },
  "про": {
    [cases.ACCUSATIVE]: frequency.FREQUENT
  },
  "проміж": {
    [cases.GENITIVE]: frequency.FREQUENT,
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.INSTRUMENTAL]: frequency.FREQUENT
  },
  "проти": {
    [cases.GENITIVE]: frequency.FREQUENT,
    [cases.ACCUSATIVE]: frequency.UNCOMMON
  },
  "протягом": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "ради": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "серед": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "стосовно": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "супроти": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "супротив": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "у": {
    [cases.GENITIVE]: frequency.FREQUENT,
    [cases.ACCUSATIVE]: frequency.FREQUENT,
    [cases.LOCATIVE]: frequency.FREQUENT
  },
  "уві": {
    [cases.ACCUSATIVE]: frequency.UNCOMMON,
    [cases.LOCATIVE]: frequency.FREQUENT
  },
  "углиб": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "уздовж": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "уздогін": {
    [cases.DATIVE]: frequency.FREQUENT
  },
  "унаслідок": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "упродовж": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "усередині": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "усередину": {
    [cases.GENITIVE]: frequency.FREQUENT
  },
  "услід": {
    [cases.DATIVE]: frequency.FREQUENT
  },
  "усупереч": {
    [cases.DATIVE]: frequency.FREQUENT
  },
  "через": {
    [cases.ACCUSATIVE]: frequency.FREQUENT
  },
  "щодо": {
    [cases.GENITIVE]: frequency.FREQUENT
  }
};