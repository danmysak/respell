import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: [
    [["Волош", "Литв", "Лучкан", "Міщан", "Рус", "Серб", "Татар", "Турч", "Турян", "Черкаш"], "ин(и)м"]
  ],
  replacement: "о",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 85 правопису, прізвища на «-ин», які походять від назв осіб за етнічною належністю або '
    + 'місцем проживання, в орудному відмінку однини набувають закінчення «-ом».'
}));