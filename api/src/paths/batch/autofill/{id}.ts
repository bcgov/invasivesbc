import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { Role } from 'constants/misc';
import OpenAPISpec from 'utils/OpenAPISpec';
import { autofillBatch } from 'utils/batch/autofillBatch';

const GET: Operation = [batchAutofill()];

new OpenAPISpec('Retro populate the autofill details for a legacy batch record', ['batch'])
  .security([Role.MASTER_ADMINISTRATOR])
  .parameters({
    description: 'batch record id',
    in: 'path',
    name: 'id',
    required: true,
    schema: {
      type: 'string',
      pattern: '^[0-9]+$'
    }
  })
  .response(204, { description: 'The resource updated successfully' })
  .build(GET);

function batchAutofill(): RequestHandler {
  return async (req, res) => {
    const id = Number.parseInt(req.params.id);
    await autofillBatch(id);
    return res.sendStatus(204);
  };
}
export { GET };
