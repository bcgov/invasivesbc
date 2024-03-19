import moment from 'moment';

let metabaseSession: string;
let metabaseSessionTimestamp: number;

export const METABASE_URL: string =
  process.env.METABASE_URL || 'https://metabase-7068ad-dev.apps.silver.devops.gov.bc.ca';
export const METABASE_USER: string = process.env.METABASE_USER || 'hello';
export const METABASE_PASS: string = process.env.METABASE_PASS || 'world';
export const METABASE_COLLECTION_ID: any = process.env.METABASE_COLLECTION_ID || 'root';
export const METABASE_TIMEOUT = 60000; // ms

/**
 * Creates a session with the Metabase API, returning the session id
 *
 * @return {string}
 */
export async function getMetabaseSession(): Promise<any> {
  if (metabaseSession && moment().valueOf() < metabaseSessionTimestamp + METABASE_TIMEOUT) return metabaseSession;

  const response = await fetch(`${METABASE_URL}/api/session`, {
    method: 'post',
    body: JSON.stringify({
      username: METABASE_USER,
      password: METABASE_PASS
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const data: any = await response.json();

  if (!data.id) {
    throw {
      code: 503,
      message: 'Failed to establish metabase session',
      namespace: 'metabase-query'
    };
  }

  metabaseSessionTimestamp = moment().valueOf();
  metabaseSession = data.id;

  return metabaseSession;
}

/**
 * Closes Metabase Session
 *
 * @return {string}
 */
export async function closeMetabaseSession(): Promise<any> {
  metabaseSession = undefined;
  metabaseSessionTimestamp = undefined;
}
