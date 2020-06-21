import {
  correctionTypes,
  registerWordRule,
  labels,
  createTreeRule,
  unpackDoubleParadigm,
  combineCorrespondences,
  determineLetterCase,
  letterCases,
  isAfterSentenceBoundary,
  simplifyApostrophe
} from "../imports.js";
import {feminitives} from "../../data/feminitives.js";

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
    callback: (token, chain) =>
      [letterCases.LOWER, letterCases.UPPER].includes(determineLetterCase(token)) || isAfterSentenceBoundary(chain),
    postprocess: (options, token, chain) => {
      const normalize = (string) => simplifyApostrophe(string).toLowerCase();
      const normalizedOptions = options.map(normalize);
      return [chain.getPreviousToken(2), chain.getNextToken(2)]
        .some((adjacent) => adjacent !== null && normalizedOptions.includes(normalize(adjacent))) ? null : options;
    },
    requiresExtraChange: true,
    lowerCase: true,
    fixApostrophe: true
  }), [labels.FEMINITIVES]
);