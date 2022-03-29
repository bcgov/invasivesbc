import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to fetch code categories.
 *
 * @returns {SQLStatement} sql query object
 */
export const getCodeCategoriesSQL = (): SQLStatement =>
  SQL`SELECT code_category_id, code_category_name FROM code_category WHERE valid_to IS NULL;`;

/**
 * SQL query to fetch employer codes.
 *
 * @returns {SQLStatement} sql query object
 *
 */
export const getEmployerCodesSQL = (): SQLStatement =>
  SQL`select
      code.code_id, 
      code.code_name, 
      code.code_description
      from code_header 
      inner join code on code_header.code_header_id=code.code_header_id
      where code_header.code_header_name='employer_code';`;

/**
 * SQL query to fetch funding agency codes.
 *
 * @returns {SQLStatement} sql query object
 *
 */
export const getFundingAgencyCodesSQL = (): SQLStatement =>
  SQL`select
      code.code_id, 
      code.code_name, 
      code.code_description
      from code_header 
      inner join code on code_header.code_header_id=code.code_header_id
      where code_header.code_header_name='invasive_species_agency_code';`;

/**
 * SQL query to fetch service license codes.
 *
 * @returns {SQLStatement} sql query object
 *
 */
export const getServiceLicenseCodesSQL = (): SQLStatement =>
  SQL`select
      code.code_id, 
      code.code_name, 
      code.code_description
      from code_header 
      inner join code on code_header.code_header_id=code.code_header_id
      where code_header.code_header_name='service_license_code';`;

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

/**
 * SQL query to fetch the list of code tables in invasives (for batch code tables view)
 *
 * @returns {SQLStatement} sql query object
 */
export const listCodeTablesSQL = (): SQLStatement => {
  return SQL`
    SELECT ch.code_header_id          as code_table,
           ch.code_header_name        as name,
           ch.code_header_title       as title,
           ch.code_header_description as description
    from code_header as ch
           inner join code_category cc on ch.code_category_id = cc.code_category_id
    where cc.code_category_name = 'invasives'
    order by ch.code_header_name asc;
  `;
};

/**
 * SQL query to fetch the list of code tables in invasives (for batch code tables view)
 *
 * @param codeHeaderName the name of the code header for which you want codes
 * @returns {SQLStatement} sql query object
 */
export const fetchCodeTablesSQL = (codeHeaderName: string): SQLStatement => {
  return SQL`
    SELECT ct.code_name as code, ct.code_description as description
    from code as ct
       inner join code_header ch on ct.code_header_id = ch.code_header_id
       inner join code_category cc on ch.code_category_id = cc.code_category_id
    where ch.code_header_name = ${codeHeaderName} and cc.code_category_name = 'invasives'
    order by ct.code_sort_order asc;
  `;
};
