import {
  correctionTypes,
  registerWordRule,
  createTreeRule,
  unpackDoubleParadigm,
  combineCorrespondences
} from "../imports.js";
import {feminitives} from '../data/feminitives.js';

registerWordRule(createTreeRule(
  combineCorrespondences(
    feminitives.flatMap(
      (group) => group.roots.map(
        (root) => unpackDoubleParadigm(group.paradigm, root + group.masculineSuffix, root + group.feminineSuffix)
      )
    )
  ),
  correctionTypes.UNCERTAIN,
  '§ 32 правопису підкреслює можливість ужитку на означення осіб жіночої статі іменників, утворених за допомогою '
    + 'суфіксів «-к-», «-иц-», «-ин-» та «-ес-».',
  {
    requiresExtraChange: true,
    lowerCase: true,
    fixApostrophe: true
  })
);