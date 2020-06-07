import {correctionTypes, registerWordRule, createMaskRule} from "../imports.js";

registerWordRule(createMaskRule({
  matches: ["Св(єнці)цьк*", "Св(єнци)цьк*", "Св(енці)цьк*"],
  replacement: "енци",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 144 правопису, прізвище польського походження слід писати як «Свенцицький».'
}));