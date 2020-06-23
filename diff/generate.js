const fs = require('fs');

const preambleInput = 'preamble.md';
const diffInput = 'diff.json';
const output = 'diff.md';
const sectionSign = '§';
const noSectionSign = '∅';
const sectionTemplate = `## {new} ← {old}: {title}`;
const sectionNewPlaceholder = '{new}';
const sectionOldPlaceholder = '{old}';
const sectionTitlePlaceholder = '{title}';
const compulsoryUpdateSign = '→';
const optionalUpdateSign = '=';
const lineDelimiter = '\n';
const sectionDelimiter = '\n\n';
const noWrappingLimit = 25;
const encoding = 'utf-8';

function fixTypography(text) {
  return text.replace(/( (?=[—/])|(?<=§) )/g, ' ');
}

const preamble = fs.readFileSync(preambleInput, encoding);
const sections = [preamble];
const json = fs.readFileSync(diffInput, encoding);

for (const item of JSON.parse(json)) {
  const heading = sectionTemplate
    .replace(sectionNewPlaceholder, item.new ? `${sectionSign} ${item.new}` : noSectionSign)
    .replace(sectionOldPlaceholder, item.old ? `${sectionSign} ${item.old.join(', ')}` : noSectionSign)
    .replace(sectionTitlePlaceholder, item.title);
  let minor;
  if (item.minor) {
    const changes = item.minor.map((change, index) => `${item.minor.length > 1 ? `${index + 1}.` : '*'} ${change}`);
    minor = ['Додатково:', ...changes].join(lineDelimiter);
  } else {
    minor = null;
  }
  let major;
  if (item.major) {
    const prepareExample = (text) =>
      (text.length > noWrappingLimit ? text : text.replace(/ /g, ' ')).replace(/(?<=\d)-/, '‑');
    const changes = item.major.flatMap(({description, examples}) => {
      return examples.map(([type, source, target], index) => {
        let optional;
        switch (type) {
          case 'compulsory':
            optional = false;
            break;
          case 'optional':
            optional = true;
            break;
          default:
            throw new Error(`Unknown type: ${type}`);
        }
        return '<tr>'
          + (index === 0 ? `<td rowspan="${examples.length}">${description}</td>` : '')
          + `<td>${prepareExample(source)}</td>`
          + `<td>${optional ? optionalUpdateSign : compulsoryUpdateSign}</td>`
          + `<td>${prepareExample(target)}</td>`
          + '</tr>';
      });
    });
    major = ['Зміни по суті:', '<table>', ...changes, '</table>'].join(lineDelimiter);
  } else {
    major = minor ? 'Зміни по суті відсутні.' : 'Зміни відсутні.';
  }
  sections.push([heading, major, minor].filter((subsection) => subsection).join(lineDelimiter + lineDelimiter));
}

fs.writeFileSync(output, fixTypography(sections.join(sectionDelimiter)), encoding);