// The order of keys in each of the enums is potentially important

export const cases = {
  NOMINATIVE: 'nominative',
  GENITIVE: 'genitive',
  DATIVE: 'dative',
  ACCUSATIVE: 'accusative',
  INSTRUMENTAL: 'instrumental',
  LOCATIVE: 'locative',
  VOCATIVE: 'vocative'
};

export const number = {
  SINGULAR: 'singular',
  PLURAL: 'plural'
};

export const nominalForms = {
  NOMINATIVE_SINGULAR: {case: cases.NOMINATIVE, number: number.SINGULAR},
  GENITIVE_SINGULAR: {case: cases.GENITIVE, number: number.SINGULAR},
  DATIVE_SINGULAR: {case: cases.DATIVE, number: number.SINGULAR},
  ACCUSATIVE_SINGULAR: {case: cases.ACCUSATIVE, number: number.SINGULAR},
  INSTRUMENTAL_SINGULAR: {case: cases.INSTRUMENTAL, number: number.SINGULAR},
  LOCATIVE_SINGULAR: {case: cases.LOCATIVE, number: number.SINGULAR},
  VOCATIVE_SINGULAR: {case: cases.VOCATIVE, number: number.SINGULAR},

  NOMINATIVE_PLURAL: {case: cases.NOMINATIVE, number: number.PLURAL},
  GENITIVE_PLURAL: {case: cases.GENITIVE, number: number.PLURAL},
  DATIVE_PLURAL: {case: cases.DATIVE, number: number.PLURAL},
  ACCUSATIVE_PLURAL: {case: cases.ACCUSATIVE, number: number.PLURAL},
  INSTRUMENTAL_PLURAL: {case: cases.INSTRUMENTAL, number: number.PLURAL},
  LOCATIVE_PLURAL: {case: cases.LOCATIVE, number: number.PLURAL},
  VOCATIVE_PLURAL: {case: cases.VOCATIVE, number: number.PLURAL}
};

export const frequency = {
  FREQUENT: 'frequent',
  UNCOMMON: 'uncommon'
};

export const groups = {
  SOFT: 'soft',
  MIXED: 'mixed',
  HARD: 'hard'
};