import {
  correctionTypes,
  registerWordRule,
  createMaskRule,
  createTreeRule,
  unpackSingleParadigmList,
  normalizeCase,
  getVowels
} from "../imports.js";
import {toponymsWithRiCommonRoots, toponymsWithRiForms} from "../data/toponyms-with-ri.js";

const pattern = new RegExp(`рі(?=[^${getVowels(true).join('')}й-])`, 'gi');
const replacement = "ри";
const description = 'Відповідно до § 129 правопису, в усіх географічних назвах іншомовного походження між «р» '
  + 'та наступним приголосним (крім «й») слід писати «и».';

function transformRootIntoMask(root) {
  return root.toLowerCase().replace(pattern, '($&)') + '*';
}

function transformFormIntoTreeEntry(form) {
  return [form, form.replace(pattern, (match) => normalizeCase(replacement, match))];
}

registerWordRule(createMaskRule({
  callback: (token) => token.match(pattern), // Potential optimization
  matches: [
    "*-(рі)вер*",
    ...toponymsWithRiCommonRoots.flatMap(
      (root) => [root, ...(root.includes('-') ? [root.replace(/-/g, '')] : [])].map(transformRootIntoMask)
    )
  ],
  replacement,
  type: correctionTypes.MISTAKE,
  description
}));

registerWordRule(createTreeRule(
  unpackSingleParadigmList(toponymsWithRiForms, transformFormIntoTreeEntry),
  correctionTypes.MISTAKE, description, {
    fixApostrophe: true
  })
);