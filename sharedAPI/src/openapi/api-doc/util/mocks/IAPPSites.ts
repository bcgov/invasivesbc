export const IAPPSitesResponse_Stub = {
  message: 'fetched sites by criteria',
  request: {
    filterObjects: [
      {
        recordSetType: 'IAPP',
        selectColumns: ['site_id'],
        limit: 200000
      }
    ]
  },
  result: [
    {
      site_id: 1
    },
    {
      site_id: 2
    },
    {
      site_id: 3
    }
  ]
};
