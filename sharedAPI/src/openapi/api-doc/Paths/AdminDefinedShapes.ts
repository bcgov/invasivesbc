export const AdminDefinedShapeResultItem = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    title: { type: 'string' },
    geojson: { $ref: '#/components/schemas/FeatureCollection' }
  }
};

export const AdminDefinedShapeResponse = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    result: { type: 'array', items: { $ref: '#/components/schemas/AdminDefinedShapeResultItem' } }
    // Add more properties if needed
  },
  required: ['message', 'result']
};
