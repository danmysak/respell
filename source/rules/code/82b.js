import {correctionTypes, registerWordRule, createTreeRule, unpackSingleParadigmList} from "../imports.js";
import {websites} from "../../data/websites.js";

registerWordRule(createTreeRule(
  unpackSingleParadigmList(
    websites,
    (form) => [form.replace(/а$/, 'у').replace(/я$/, 'ю'), form],
    (group) => group.masculineGenitiveSuffixes
  ),
  correctionTypes.UNCERTAIN,
  'Відповідно до § 82 правопису, назви сайтів чоловічого роду в родовому відмінку однини мають закінчення «-а»/«-я».',
  {
    lowerCase: true,
    fixApostrophe: true
  })
);