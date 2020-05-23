import {
  correctionTypes,
  registerWordRule,
  createTreeRule,
  unpackDoubleParadigm,
  combineCorrespondences,
  determineLetterCase,
  letterCases
} from "../imports.js";
import {towns} from "../../data/towns.js";

Object.entries({
  [correctionTypes.IMPROVEMENT]: towns.certain,
  [correctionTypes.UNCERTAIN]: towns.uncertain
}).forEach(([type, townList]) => {
  registerWordRule(createTreeRule(
    combineCorrespondences(
      townList.flatMap(
        (group) => group.roots.map(
          (root) => unpackDoubleParadigm(group.paradigm, root.toLowerCase())
        )
      )
    ),
    type,
    'Відповідно до § 82 правопису, назви населених пунктів чоловічого роду паралельно до «-а»/«-я» можуть набувати '
      + 'в родовому відмінку однини закінчення «-у»/«-ю» — за винятком тих, що в цьому відмінку мають наголос '
      + 'на останньому складі, у називному відмінку закінчуються на «-а», «-о», «-я», омонімічні з назвою більшої '
      + 'території чи мають суфікси «-ськ», «-цьк», «-ець», суфікси присвійності «-ів», «-їв», «-ев», «-єв», «-ов», '
      + '«-ин», «-ін», «-ач», «-ич», «-яч» або частинки «-бург», «-град», «-город», «-піль», «-поль», «-мир», «-слав».',
    {
      callback: (token) =>
        [letterCases.CAPITALIZED, letterCases.CAMEL, letterCases.UPPER].includes(determineLetterCase(token)),
      lowerCase: true,
      fixApostrophe: true
    })
  );
});