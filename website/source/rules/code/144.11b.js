import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["ий", "им", "ім", "ого", "ому"].map((ending) => `Гуляшк(${ending})`),
  replacement: "и",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 144 правопису, прізвище «Гуляшки» не має «й» у кінці та не відмінюється.'
}));