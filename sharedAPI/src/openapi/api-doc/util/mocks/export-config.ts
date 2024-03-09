export const exportConfigStub = {
  message: 'Successfully retrieved export metadata.',
  result: [
    {
      type: 'activities',
      time: '2024-03-09T04:06:48.337Z',
      last_record: 366527,
      file_reference: 'activities.1s7t8rm2ym.dev.json.gz',
      url: 'fake_zipped_activity_json_url'
    },
    {
      type: 'iapp',
      time: '2024-03-09T04:06:47.244Z',
      last_record: 112739,
      file_reference: 'iapp.1s7t8rm2ym.dev.json.gz',
      url: 'fake_zipped_iapp_json_url'
    }
  ],
  count: 2,
  namespace: 'export-config',
  code: 200
};
