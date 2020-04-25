import {correctionTypes, registerWordRule, createTreeRule, unpackParadigm, combineCorrespondences} from "../imports.js";
import {feminitives} from '../data/feminitives.js';

registerWordRule(createTreeRule(
  combineCorrespondences(
    feminitives.flatMap(
      (group) => group.roots.map(
        (root) => unpackParadigm(root, group.paradigm, group.masculineSuffix, group.feminineSuffix)
      )
    )
  ),
  correctionTypes.UNSURE,
  '§ 32 правопису підкреслює можливість ужитку на означення осіб жіночої статі іменників, утворених за допомогою '
    + 'суфіксів «-к-», «-иц-», «-ин-» та «-ес-».',
  {
    requiresExtraChange: true,
    lowerCase: true,
    fixApostrophe: true
  })
);