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

// const defaultLog = getLogger('code-utils');

export interface IAllCodeEntities {
  categories: QueryResultRow[];
  headers: QueryResultRow[];
  codes: QueryResultRow[];
}

export async function getAllCodeEntities(user?: any, filterForSelectable?: boolean): Promise<IAllCodeEntities> {
  const connection = await getDBConnection();
  const pesticideServiceNumbers = [];
  const employers = [];
  const agencies = [];

  // Fetch user info from params
  if (user && filterForSelectable) {
    if (user.pac_service_number_1) {
      pesticideServiceNumbers.push(user.pac_service_number_1.replace(/^0+(\d)/, ''));
    }
    if (user.pac_service_number_2) {
      pesticideServiceNumbers.push(user.pac_service_number_2.replace(/^0+(\d)/, ''));
    }
    /*if (user.employer) {
      employers.push(user.employer);
    }*/
    if (user.employer && user.employer?.split(',')?.length > 0) {
      const employerSplit = user.employer?.split(',');
      for (let i = 0; i < employerSplit.length; i++) {
        employers.push(employerSplit[i]);
      }
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
      code: 503,
      message: 'Failed to establish database connection',
      namespace: 'code-utils'
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
        code: 400,
        message: 'Failed to build SQL statement',
        namespace: 'code-utils'
      };
    }

    const promises = [];

    promises.push(connection.query(codeCategoriesSQL.text, codeCategoriesSQL.values));
    promises.push(connection.query(codeHeadersSQL.text, codeHeadersSQL.values));
    promises.push(connection.query(codesSQL.text, codesSQL.values));
    promises.push(connection.query(employerCodesSql.text, employerCodesSql.values));
    promises.push(connection.query(agencyCodesSql.text, agencyCodesSql.values));
    promises.push(connection.query(psnCodesSql.text, psnCodesSql.values));

    const responses: QueryResult[] = await Promise.all(promises);

    if (!responses || (!user && responses.length !== 3) || (user && responses.length !== 6)) {
      return null;
    }

    if (user && filterForSelectable) {
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
      if (
        user.roles &&
        user.roles.some(
          (role: any) => role.role_name.includes('bcgov') || role.role_name.includes('master_administrator')
        )
      ) {
        filteredPSNCodes.push(responses[5].rows.find((psnCode: any) => psnCode.code_name === '0'));
      }
      filteredPSNCodes.push(responses[5].rows.find((psnCode: any) => psnCode.code_name === 'NRQ'));

      const employerCodeHeaderId = responses[1].rows.find((code: any) => code.code_header_name === 'employer_code')
        .code_header_id;

      const agencyCodeHeaderId = responses[1].rows.find(
        (code: any) => code.code_header_name === 'invasive_species_agency_code'
      ).code_header_id;

      const psnCodeHeaderId = responses[1].rows.find((code: any) => code.code_header_name === 'service_license_code')
        .code_header_id;

      const filteredCodes = responses[2].rows.filter((code: any) => {
        if (user) {
          if (code?.code_header_id === employerCodeHeaderId) {
            return filteredEmployerCodes.some((employerCode: any) => {
              return employerCode?.code_id === code?.code_id;
            });
          } else if (code?.code_header_id === agencyCodeHeaderId) {
            return filteredAgencyCodes?.some((agencyCode: any) => {
              return agencyCode?.code_id === code?.code_id;
            });
          } else if (code?.code_header_id === psnCodeHeaderId) {
            return filteredPSNCodes.some((psnCode: any) => {
              return psnCode?.code_id === code?.code_id;
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
    // defaultLog.debug({ label: 'getAllCodeEntities', message: 'error', error });
    throw {
      code: 500,
      message: 'Failed to get all code entities',
      namespace: 'code-utils'
    };
  } finally {
    connection.release();
  }
}
