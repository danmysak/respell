import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

const endings = ["", "а", "и", "ові", "у", "ою", "о", "ам", "ів", "ами", "ах"];

registerWordRule(createMaskRule({
  replacement: "ґ",
  rules: [{
    matches: ["(г)ор(г)ан*", "(г)оронд*", "У(г)ля", "У(г)лю", "У(г)лям", "У(г)лі"],
    description: 'Відповідно до § 6 правопису, топоніми «Ґорґани», «Ґоронда» та «Уґля» пишуться через «ґ».',
    type: correctionTypes.MISTAKE,
  }, {
    description: 'Відповідно до § 6 правопису, прізвища «Ґалятовський», «Ґеник», «Ґерзанич», «Ґердан», «Ґжицький», '
      + '«Ґиґа», «Ґоґа», «Ґойдич», «Ґонта», «Ґриґа», «Ґула», «Ломаґа» мають писатися через «ґ».',
    rules: [{
      matches: [
        "(Г)алятовськ*", "(Г)еник*", "(Г)ерзанич*", "(Г)ердан*", "(Г)жицьк*", "(Г)ойдич*", "(Г)онт*", "Лома(г)*",
        ["(Г)и(г)", endings], "(Г)изі",
        ["(Г)ри(г)", endings], "(Г)ризі"
      ],
      type: correctionTypes.MISTAKE
    }, {
      matches: [
        ["(Г)о(г)", endings], "(Г)озі",
        ["(Г)ул", endings], "(Г)улі",
      ],
      type: correctionTypes.UNSURE
    }]
  }]
}));