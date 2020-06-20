import {registerWordRule, correctionTypes, createTreeRule, unpackSingleParadigmList} from "../imports.js";
import {namesWithIn} from "../../data/names-with-in.js";

// Only proper nouns are examined, since common nouns ending in "-ін"/"-їн" seem to have already been listed with the
// "-ові" ending in dictionaries (along with the "-у" ending), while the ending paradoxically doesn't feel to fit most
// of them at all ("новокаїнові"?..). Also, only proper nouns are presented as examples for this change in the
// Orthography.

registerWordRule(createTreeRule(
  unpackSingleParadigmList(namesWithIn, (form) => [form.toLowerCase() + 'у', form.toLowerCase() + 'ові']),
  correctionTypes.UNCERTAIN,
  'Відповідно до § 83 правопису, іменники чоловічого роду на «-ін», «-їн» можуть у давальному відмінку однини набувати '
    + 'закінчення «-ові» паралельно з «-у».',
  {
    lowerCase: true,
    fixApostrophe: true
  })
);