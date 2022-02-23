import { QueryResult, QueryResultRow } from 'pg';
import { SQLStatement } from 'sql-template-strings';
import { getDBConnection } from '../database/db';
import {
  getCodeCategoriesSQL,
  getCodeHeadersSQL,
  getCodesSQL,
  getEmployerCodesSQL,
  getFundingAgencyCodesSQL,
  getServiceLicenseCodesSQL
} from '../queries/code-queries';
import { getLogger } from './logger';

const defaultLog = getLogger('code-utils');

export interface IAllCodeEntities {
  categories: QueryResultRow[];
  headers: QueryResultRow[];
  codes: QueryResultRow[];
}

export async function getAllCodeEntities(user?: any): Promise<IAllCodeEntities> {
  const connection = await getDBConnection();
  const pesticideServiceNumbers = [];
  const employers = [];
  const agencies = [];

  // Fetch user info from params
  if (user) {
    if (user.pac_service_number_1) {
      pesticideServiceNumbers.push(user.pac_service_number_1.replace(/^0+(\d)/, ''));
    }
    if (user.pac_service_number_2) {
      pesticideServiceNumbers.push(user.pac_service_number_2.replace(/^0+(\d)/, ''));
    }
    if (user.employer) {
      employers.push(user.employer);
    }
    if (user.funding_agencies && user.funding_agencies?.split(',')?.length > 0) {
      const agenciesSplit = user.funding_agencies?.split(',');
      for (let i = 0; i < agenciesSplit.length; i++) {
        agencies.push(agenciesSplit[i]);
      }
    }
  }

  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }

  try {
    const codeCategoriesSQL: SQLStatement = getCodeCategoriesSQL();
    const codeHeadersSQL: SQLStatement = getCodeHeadersSQL();
    const codesSQL: SQLStatement = getCodesSQL();
    const employerCodesSql: SQLStatement = getEmployerCodesSQL();
    const agencyCodesSql: SQLStatement = getFundingAgencyCodesSQL();
    const psnCodesSql: SQLStatement = getServiceLicenseCodesSQL();

    if (!codeCategoriesSQL || !codeHeadersSQL || !codesSQL) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }

    const promises = [];

    promises.push(connection.query(codeCategoriesSQL.text, codeCategoriesSQL.values));
    promises.push(connection.query(codeHeadersSQL.text, codeHeadersSQL.values));
    promises.push(connection.query(codesSQL.text, codesSQL.values));
    if (user) {
      promises.push(connection.query(employerCodesSql.text, employerCodesSql.values));
      promises.push(connection.query(agencyCodesSql.text, agencyCodesSql.values));
      promises.push(connection.query(psnCodesSql.text, psnCodesSql.values));
    }

    const responses: QueryResult[] = await Promise.all(promises);

    if (!responses || (!user && responses.length !== 3) || (user && responses.length !== 6)) {
      return null;
    }

    if (user) {
      // From responses[3].rows, filter out any employer codes that are not in the user's list of employers
      const filteredEmployerCodes = responses[3].rows.filter((employerCode: any) => {
        return employers.includes(employerCode.code_name);
      });
      // From responses[4].rows, filter out any agency codes that are not in the user's list of agencies
      // If they are a gov user, the only agency that should be available is 000000
      const filteredAgencyCodes = responses[4].rows.filter((agencyCode: any) => {
        return agencies.includes(agencyCode.code_name);
      });

      // From responses[5].rows, filter out any psn codes that are not in the user's list of psn numbers
      const filteredPSNCodes = responses[5].rows.filter((psnCode: any) => {
        return pesticideServiceNumbers.includes(psnCode.code_name);
      });

      // If user.roles contains a role with a role that contains the name "bcgov", append 000000 to the filtered agency codes
      if (user.roles && user.roles.some((role: any) => role.role_name.includes('bcgov'))) {
        filteredPSNCodes.push(responses[5].rows.find((psnCode: any) => psnCode.code_name === '0'));
      }

      const filteredCodes = responses[2].rows.filter((code: any) => {
        if (user) {
          if (code.code_header_id === 76) {
            return filteredEmployerCodes.some((employerCode: any) => {
              return employerCode.code_id === code.code_id;
            });
          } else if (code.code_header_id === 41) {
            return filteredAgencyCodes.some((agencyCode: any) => {
              return agencyCode.code_id === code.code_id;
            });
          } else if (code.code_header_id === 43) {
            return filteredPSNCodes.some((psnCode: any) => {
              return psnCode.code_id === code.code_id;
            });
          }
        }
        return true;
      });
      return {
        categories: responses[0].rows,
        headers: responses[1].rows,
        codes: filteredCodes
      };
    } else {
      return {
        categories: responses[0].rows,
        headers: responses[1].rows,
        codes: responses[2].rows
      };
    }
  } catch (error) {
    defaultLog.debug({ label: 'getAllCodeEntities', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
}
