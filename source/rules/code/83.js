import {registerWordRule, correctionTypes, createTreeRule, unpackSingleParadigmList} from "../imports.js";
import {masculineInYin} from "../data/masculine-in-yin.js";

registerWordRule(createTreeRule(
  unpackSingleParadigmList(masculineInYin,(form) => [form.toLowerCase() + 'у', form.toLowerCase() + 'ові']),
  correctionTypes.UNCERTAIN,
  'Відповідно до § 83 правопису, іменники чоловічого роду на «-ін», «-їн» можуть у давальному відмінку однини набувати '
    + 'закінчення «-ові» паралельно з «-у».',
  {
    lowerCase: true,
    fixApostrophe: true
  })
);