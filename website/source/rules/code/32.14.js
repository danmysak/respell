import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["*більшов", "меншов", "боротьб", "значк", "кучк", "наплюв", "побутов", "речов", "служб"]
    .map((match) => [`${match}(и)`, ["зм*", "ст*"]]),
  replacement: "і",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 32 правопису, з коренями українського походження, що закінчуються не на один зі звуків '
    + '«д», «т», «з», «с», «ц», «ж», «ч», «ш», «р», вживаємо суфікси «-іст», «-ізм» через «і».'
}));