import {correctionTypes, registerWordRule, createWordRule} from "../imports.js";

registerWordRule(createWordRule({
  matches: ["(й)"],
  replacement: "та",
  type: correctionTypes.MISTAKE,
  previousMatches: [
    ["*", ["й", "я", "ю", "є", "ї"]]
  ],
  description: 'Відповідно до § 24 правопису, після слова, що закінчується на «й», «я», «ю», «є», «ї», слід вживати '
    + 'сполучники «і» або «та».'
}));