import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["бе(бі-)бум*", "бе(йбі-)бум*", "бе(йбі)бум*"],
  replacement: "бі",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 133 правопису, слово «бебібум» слід писати без літери «й» та дефіса.'
}));