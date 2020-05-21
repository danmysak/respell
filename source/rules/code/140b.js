import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["міс(і)с"],
  replacement: "и",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 140 правопису, слово «місис» слід писати з «и» в останньому складі.'
}));

registerWordRule(createMaskRule({
  matches: ["е", "ей", "і", "лю", "ям", "ями", "ях"].map((ending) => `*мадемуазел(${ending})`),
  replacement: "ь",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 140 правопису, слово «мадемуазель» є невідмінюваним.'
}));