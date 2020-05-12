import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: [
    [["*тр", "*чотир"], "(и)", ["тисячн*", "мільйонн*", "мільярдн*", "трильйонн*", "трильярдн*"]]
  ],
  replacement: "ьох",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 106 правопису, числівники «три» й «чотири» поєднуються з частинами «тисячний», '
    + '«мільйонний» і подібними лише у формах «трьох-», «чотирьох-».'
}));