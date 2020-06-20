const fs = require('fs');

const preambleInput = 'preamble.md';
const diffInput = 'diff.json';
const output = 'diff.md';
const sectionSign = '§';
const noSectionSign = '∅';
const sectionTemplate = `## {new}<span style="color: gray"> ← {old}</span>`;
const sectionNewPlaceholder = '{new}';
const sectionOldPlaceholder = '{old}';
const compulsoryUpdateSign = '→';
const optionalUpdateSign = '=';
const lineDelimiter = '\n';
const sectionDelimiter = '\n\n';
const encoding = 'utf-8';

const preamble = fs.readFileSync(preambleInput, encoding);
const sections = [preamble];
const json = fs.readFileSync(diffInput, encoding);

for (const item of JSON.parse(json)) {
  const heading = sectionTemplate
    .replace(sectionNewPlaceholder, item.new ? `${sectionSign} ${item.new}` : noSectionSign)
    .replace(sectionOldPlaceholder, item.old ? `${sectionSign} ${item.old.join(', ')}` : noSectionSign);
  let major;
  if (item.major) {
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
          + `<td>${source}</td>`
          + `<td>${optional ? optionalUpdateSign : compulsoryUpdateSign}</td>`
          + `<td>${target}</td>`
          + '</tr>';
      });
    });
    major = ['Зміни по суті:', '<table>', ...changes, '</table>'].join(lineDelimiter);
  } else {
    major = 'Зміни по суті відсутні.';
  }
  let minor;
  if (item.minor) {
    const changes = item.minor.map((change, index) => `${item.minor.length > 1 ? `${index + 1}.` : '*'} ${change}`);
    minor = ['Додатково:', ...changes].join(lineDelimiter);
  } else {
    minor = null;
  }
  sections.push([heading, major, minor].filter((subsection) => subsection).join(lineDelimiter + lineDelimiter));
}

fs.writeFileSync(output, sections.join(sectionDelimiter), encoding);