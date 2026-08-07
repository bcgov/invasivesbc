import { ActivityLetters, ActivitySubtypes } from 'sharedAPI';

interface ReturnVal {
  id: string;
  short_id: string;
}
/**
 * Generate A v4 UUID / Short ID for a new record.
 * @param {ActivitySubtypes} subtype
 */
const createRecordId = (subtype: ActivitySubtypes): ReturnVal => {
  const id = crypto.randomUUID();
  const dateStamp = new Date().toISOString().slice(2, 4);
  const subtypeTag = ActivityLetters[subtype] ?? '';
  const uuidSlice = id.slice(0, 8).toUpperCase();
  const short_id = dateStamp + subtypeTag + uuidSlice;

  return { id, short_id };
};

export default createRecordId;
