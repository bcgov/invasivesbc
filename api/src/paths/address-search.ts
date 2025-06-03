import axios from 'axios';
import { RequestHandler } from 'express';
import { IParsedAddress } from 'sharedAPI/src/interfaces/IParsedAddress';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from 'constants/misc';
import { getLogger } from 'utils/logger';
import { InvasivesRequest } from 'utils/auth-utils';

const NAMESPACE = 'address-search';

const defaultLog = getLogger(NAMESPACE);
const GET: Operation = [getHandler()];

GET.apiDoc = {
  description: 'Partial Address Lookup via BC Geocoder API',
  tags: [NAMESPACE],
  security: SECURITY_ON ? [{ Bearer: ALL_ROLES }] : [],
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
                    shape: {
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
  delete feature.properties?.geometry?.crs;
  const strippedFeature = {
    type: feature.type,
    geometry: feature.geometry,
    coordinates: feature.coordinates
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

      const API_KEY = process.env.API_KEY;

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

      const { data } = await axios.get(BASE_URL + params, { headers: { 'x-api-key': API_KEY } });

      const response = {
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
      return res.status(400).json(response);
    } catch (err) {
      const response = {
        error: err,
        request: req.query.addr as string,
        namespace: NAMESPACE
      };

      defaultLog.error(response);
      return res.status(500).json(response);
    }
  };
}

export { GET };
