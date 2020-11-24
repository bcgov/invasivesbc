import { getDBConnection } from '../database/db';
import { getLogger } from './logger';

export const commit = function (record) {
  console.log(record);
};