import {
  registerWordRule,
  correctionTypes,
  createTreeRule,
  normalizeCase,
  getCompatibleNominalForms,
  decliners,
  unique,
  labels
} from "../imports.js";
import {feminineNamesWithLOrLabial} from "../../data/feminine-names-with-l-or-labial.js";

registerWordRule(createTreeRule(
  Object.fromEntries(feminineNamesWithLOrLabial.map((name) => [name.toLowerCase(), ''])), correctionTypes.UNCERTAIN,
  'Відповідно до § 140 правопису, жіночі імена, що закінчуються на губний або м’який приголосний (крім «й»), '
    + 'відмінюються.',
  {
    postprocess: (options, token, chain) => unique(getCompatibleNominalForms(chain).flatMap(
      (nominalForm) => decliners.feminineConsonantalForeign.decline(token.toLowerCase(), nominalForm)
        .map((form) => normalizeCase(form, token))
    )),
    lowerCase: true,
    fixApostrophe: true
  }), [labels.FOREIGN_NAMES]
);