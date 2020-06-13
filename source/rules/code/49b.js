import {Correction, correctionTypes, registerWordRule, canBeSentenceBoundary} from "../imports.js";

registerWordRule((token, chain) => {
  const match = token.match(/^Д(['’][А-ЯҐЄІЇ][а-яґєії'’-]+)$/);
  if (!match || canBeSentenceBoundary(chain.getPreviousToken())) {
    return null;
  }
  // It seems that the "д'" particle should always be in lower case, even for the name "д'Аламбер" ("d'Alembert")
  return new Correction(correctionTypes.MISTAKE, `д${match[1]}`,
    'Згідно з § 49 правопису, в іменах, що починаються на «д’», перед апострофом слід писати малу літеру «д» '
      + '(відповідно до написання в мові оригіналу).'
  );
});