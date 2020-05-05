import {data as hardCertain} from './towns/hard-certain.js';
import {data as hardUncertain} from './towns/hard-uncertain.js';
import {data as softCertain} from './towns/soft-certain.js';
import {data as softUncertain} from './towns/soft-uncertain.js';

export const towns = {
  certain: [hardCertain, softCertain],
  uncertain: [hardUncertain, softUncertain]
};