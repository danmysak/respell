import {
  correctionTypes,
  registerWordRule,
  labels,
  createTreeRule,
  treeWildcardCharacter,
  unpackDoubleParadigm,
  combineCorrespondences,
  determineLetterCase,
  letterCases,
  isAfterSentenceBoundary,
  simplifyApostrophe
} from "../imports.js";
import {feminitives} from "../../data/feminitives.js";

const minWildcardStemLength = 6;

function applyWildcard(stem) {
  return stem.length < minWildcardStemLength ? stem : treeWildcardCharacter + stem;
}

registerWordRule(createTreeRule(
  combineCorrespondences(
    feminitives.flatMap(
      (group) => group.roots.map(
        (root) => unpackDoubleParadigm(
          group.paradigm,
          applyWildcard(root + group.masculineSuffix),
          root + group.feminineSuffix
        )
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
    recursive: true,
    requiresExtraChange: true,
    lowerCase: true,
    fixApostrophe: true
  }), [labels.FEMINITIVES]
);