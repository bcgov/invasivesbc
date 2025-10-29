import { Operation } from 'express-openapi';
import { SECURITY_ON } from 'constants/misc';

class OpenAPISpec {
  private readonly apiDoc = {
    description: '',
    tags: [],
    security: [],
    requestBody: {
      description: 'Access request post request object.',
      content: {
        'application/json': {
          schema: {
            properties: {}
          }
        }
      }
    },
    responses: {
      '200': {
        $ref: '#/components/responses/200'
      },
      '401': {
        $ref: '#/components/responses/401'
      },
      '503': {
        $ref: '#/components/responses/503'
      },
      default: {
        $ref: '#/components/responses/default'
      }
    }
  };
  constructor(description: string, tags: Array<string> = []) {
    Object.assign(this.apiDoc, { description, tags });
  }

  security = (newVal: Array<unknown> = []) => {
    if (newVal.length > 0) {
      this.apiDoc.security = SECURITY_ON ? [{ Bearer: newVal }] : [];
    }
    return this;
  };

  requestBody = (newVal: Record<PropertyKey, unknown>) => {
    (this.apiDoc.requestBody as unknown as Record<PropertyKey, unknown>) = newVal;
    return this;
  };

  response(code: number, response: Record<PropertyKey, unknown>) {
    this.apiDoc.responses[code.toString()] = response;
    return this;
  }
  build = (method: Operation) => {
    method.apiDoc = this.apiDoc;
  };
}

export default OpenAPISpec;
