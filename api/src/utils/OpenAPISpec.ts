import { Operation } from 'express-openapi';
import { SECURITY_ON } from 'constants/misc';

interface QueryParameter {
  in: string;
  name: string;
  required: boolean;
  description?: string;
  content?: Record<PropertyKey, unknown>;
}
interface PathParameter {
  in: string;
  name: string;
  required: boolean;
  description: string;
  schema: {
    type: string;
    pattern?: string;
  };
}

type Parameter = QueryParameter | PathParameter;

class OpenAPISpec {
  private readonly apiDoc = {
    description: '',
    tags: [],
    security: [],
    parameters: [],
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
   * @link https://swagger.io/docs/specification/v3_0/authentication/bearer-authentication/
   */
  security = (newVal: Array<string> = []) => {
    this.apiDoc.security = SECURITY_ON ? [{ Bearer: newVal }] : [];
    return this;
  };

  /** @link https://swagger.io/docs/specification/v3_0/describing-request-body/describing-request-body/ */
  requestBody = (newVal: Record<PropertyKey, unknown>) => {
    (this.apiDoc.requestBody as unknown as Record<PropertyKey, unknown>) = newVal;
    return this;
  };

  /** @link https://swagger.io/docs/specification/v3_0/describing-responses/ */
  response(code: number, response: Record<PropertyKey, unknown>) {
    this.apiDoc.responses[code.toString()] = response;
    return this;
  }

  /** @link https://swagger.io/docs/specification/v3_0/describing-parameters/ */
  parameters = (newVal: Parameter | Array<Parameter>) => {
    if (Array.isArray(newVal)) {
      this.apiDoc.parameters = newVal;
    } else {
      this.apiDoc.parameters.push(newVal);
    }
    return this;
  };

  build = (method: Operation) => {
    method.apiDoc = this.apiDoc;
  };
}

export default OpenAPISpec;
