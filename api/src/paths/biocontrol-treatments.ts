import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import SQL, { SQLStatement } from 'sql-template-strings';

import { ACTIVATED_ROLES } from 'constants/misc';
import OpenAPISpec from 'utils/OpenAPISpec';
import QueryHandler from 'utils/endpoints/QueryHandler';

const GET: Operation = [getBiocontrolTreatments()];
new OpenAPISpec('Fetches all Biocontrol treatment code pairings', ['biocontrol-treatments'])
  .security(ACTIVATED_ROLES)
  .response(200, {
    description: 'Biocontrol treatments response object',
    content: {
      'application/json': {
        schema: {
          properties: {}
        }
      }
    }
  })
  .build(GET);

function getBiocontrolTreatments(): RequestHandler {
  return async (_r, res, _n) => {
    const sqlStatement: SQLStatement = SQL`SELECT plant_code_name, agent_code_name
                                           FROM plant_agent_treatment;`;
    const { rows } = await new QueryHandler().query(sqlStatement);
    return res.status(200).json({ result: rows });
  };
}

export { GET };
