import { RequestHandler } from 'express';
import IParsedAddress from 'sharedAPI/src/interfaces/IParsedAddress';
import { Operation } from 'express-openapi';
import { ACTIVATED_ROLES, SECURITY_ON } from 'constants/misc';
import { getLogger } from 'utils/logger';
import { InvasivesRequest } from 'utils/auth-utils';

const NAMESPACE = 'address-search';

const defaultLog = getLogger(NAMESPACE);
const GET: Operation = [getHandler()];

GET.apiDoc = {
  description: 'Partial Address Lookup via BC Geocoder API',
  tags: [NAMESPACE],
  security: SECURITY_ON ? [{ Bearer: ACTIVATED_ROLES }] : [],
  parameters: [
    {
      in: 'query',
      name: 'addr',
      required: true,
      description: 'Partial address for lookup',
      example: '123 Main Street'
    }
  ],
  responses: {
    200: {
      description: 'Results of search',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              request: {
                type: 'string',
                description: 'The original request'
              },
              results: {
                type: 'array',
                description: 'Array of suggested addresses and geometries',
                items: {
                  type: 'object',
                  properties: {
                    suggestedAddress: {
                      type: 'string',
                      description: 'Suggested Full address string'
                    },
                    feature: {
                      $ref: '#/components/schemas/Feature'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

const propertyParser = (feature): IParsedAddress => {
  const suggestedAddress = feature.properties.fullAddress;
  delete feature.geometry?.crs;
  const strippedFeature = {
    coordinates: feature.coordinates,
    geometry: feature.geometry,
    properties: {},
    type: feature.type
  };

  return { suggestedAddress, feature: strippedFeature };
};

/**
 * @desc Create Bounding box based on the filter properties for a given recordset
 */
function getHandler(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    try {
      const addrString: string = req.query.addr as string;

      // They advertise an API Key but the endpoints works without one.
      // If that changes, this is ready to go
      const GEOCODER_API_KEY = process.env.GEOCODER_API_KEY;

      const params = new URLSearchParams({
        maxResults: '5',
        locationDescriptor: 'any',
        provinceCode: 'BC',
        minScore: '45',
        exactSpelling: 'false',
        autoComplete: 'true',
        addressString: addrString,
        matchPrecision: 'block,street,locality'
      });

      const BASE_URL = process.env.GEOCODER_API_BASE;

      const response = await fetch(BASE_URL + '?' + params, { headers: { 'x-api-key': GEOCODER_API_KEY } });
      const data = (await response.json()) as Record<PropertyKey, any>;
      const templateResponse = {
        results: [],
        request: addrString,
        namespace: NAMESPACE
      };
      if (data.features.length > 0) {
        const parsedResults = data.features.map((property) => propertyParser(property));
        return res.status(200).json({
          ...response,
          results: parsedResults
        });
      }
      return res.status(400).json(templateResponse);
    } catch (err) {
      const templateResponse = {
        error: err,
        request: req.query.addr as string,
        namespace: NAMESPACE
      };

      defaultLog.error(templateResponse);
      return res.status(500).json(templateResponse);
    }
  };
}

export { GET };
