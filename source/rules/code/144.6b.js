import {correctionTypes, registerWordRule, createMaskRule, isCapitalized} from "../imports.js";

registerWordRule(createMaskRule({
  callback: (token) => isCapitalized(token) && token.match(/ці/i), // Potential optimization
  matches: [
    // Polish:
    "Вц(і)сл*",
    "Марц(і)н*",
    "Мсц(і)слав*", "Мсьц(і)слав*",
    "Рац(і)бор*",
    "Спиц(і)мир*", "Спиц(і)мір*",
    "Франц(і)ш*",
    "*ц(і)нськ*",
    "Ц(і)рліц*",
    "Ц(і)хоцьк*",
    "Ц(і)шевськ*",

    // Czech and Slovak:
    "Ц(і)бул*"
  ],
  replacement: "и",
  type: correctionTypes.MISTAKE,
  description: 'Відповідно до § 144 правопису, після «ц» у польських, чеських та словацьких іменах та прізвищах на ' +
    'місці латинського «i» слід писати українське «и».'
}));