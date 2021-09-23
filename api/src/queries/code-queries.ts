import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to fetch code categories.
 *
 * @returns {SQLStatement} sql query object
 */
export const getCodeCategoriesSQL = (): SQLStatement =>
  SQL`SELECT code_category_id, code_category_name FROM code_category WHERE valid_to IS NULL;`;

/**
 * SQL query to fetch code headers.
 *
 * @returns {SQLStatement} sql query object
 */
export const getCodeHeadersSQL = (): SQLStatement =>
  SQL`SELECT code_header_id, code_category_id, code_header_name FROM code_header WHERE valid_to IS NULL;`;

/**
 * SQL query to fetch codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getCodesSQL = (): SQLStatement =>
  SQL`SELECT code_id, code_header_id, code_name, code_description, code_sort_order FROM code WHERE valid_to IS NULL;`;
