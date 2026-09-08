import { Readable } from 'stream';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { stringify } from 'csv-stringify';
import { ACTIVATED_ROLES, SECURITY_ON } from 'constants/misc';
import { TemplateService } from 'utils/batch/template-utils';

const GET: Operation = [downloadCodeTables()];

const GET_API_DOC = {
  tags: ['batch', 'codes'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ACTIVATED_ROLES
        }
      ]
    : []
};

GET.apiDoc = {
  description: 'Download all codes used in CSV templates, in CSV or JSON format',
  ...GET_API_DOC
};

function downloadCodeTables(): RequestHandler {
  return async (req, res) => {
    switch (req.headers.accept) {
      case 'text/csv': {
        res.status(200).contentType('text/csv');
        const entryStream = Readable.from(TemplateService.codeValues());
        entryStream
          .pipe(
            stringify({
              escape_formulas: true,
              objectMode: true,
              header: true,
              columns: [
                {
                  key: 'template_name',
                  header: 'Template'
                },
                {
                  key: 'column_name',
                  header: 'Column'
                },
                { key: 'code_internal_name', header: 'Code Name' },
                {
                  key: 'code_value',
                  header: 'Code'
                },
                {
                  key: 'code_description',
                  header: 'Code Description'
                }
              ]
            })
          )
          .pipe(res);
        break;
      }
      case 'application/json':
      default: {
        res.status(200).contentType('application/json');
        res.write('[\n');
        for await (const c of TemplateService.codeValues()) {
          res.write(JSON.stringify(c) + ',\n');
        }
        res.write(']\n');
        res.end();
        break;
      }
    }
  };
}

export { GET };
