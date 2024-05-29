import { FORM_SUBTYPES_WITH_AREA_LIMITS, MAX_AREA } from './constants';

export function lookupAreaLimit(activityFormSubtype: string): number {
  let areaLimit = Number.POSITIVE_INFINITY;

  if (FORM_SUBTYPES_WITH_AREA_LIMITS.includes(activityFormSubtype)) {
    areaLimit = MAX_AREA;
  }

  return areaLimit;
}
