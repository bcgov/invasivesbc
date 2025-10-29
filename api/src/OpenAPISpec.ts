import { Operation } from 'express-openapi';
import { SECURITY_ON } from 'constants/misc';

class OpenAPISpec {
  private readonly apiDoc = {
    description: '',
    tags: [],
    security: [],
    requestBody: {
      description: null,
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

  /**
   * @desc Sets permissions needed on the OpenAPI Doc
   * @param newVal Roles to apply to endpoint
   * @example [Role.Admin] - User must have Admin Role
   * @example [*empty*] - Accessible by anyone logged in, even if no roles.
   */
  security = (newVal: Array<string> = []) => {
    this.apiDoc.security = SECURITY_ON ? [{ Bearer: newVal }] : [];
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
