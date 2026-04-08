import { SM2Data } from '@/types';
import { addDays } from 'date-fns';

/**
 * SM-2 Algorithm Implementation
 * @param quality 0-5 grade of the response
 * @param previousData Current SM2Data for the item
 * @returns Updated SM2Data
 */
export function calculateSM2(quality: number, previousData: SM2Data): SM2Data {
  let { repetitions, interval, ease_factor } = previousData;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease_factor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease_factor < 1.3) {
    ease_factor = 1.3;
  }

  const next_review = addDays(new Date(), interval).toISOString();

  return {
    repetitions,
    interval,
    ease_factor,
    next_review,
  };
}

export const INITIAL_SM2_DATA: SM2Data = {
  repetitions: 0,
  interval: 0,
  ease_factor: 2.5,
  next_review: new Date().toISOString(),
};
