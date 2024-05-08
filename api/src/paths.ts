const PATHS_TO_LOAD = [
  'access-request',
  'access-request-read',
  'activities',
  'activities-lean',
  'activity',
  'activity-lean/{activityId}',
  'activity/{activityId}',
  'admin-defined-shapes',
  'agency_codes',
  'application-user',
  'application-user/renew',
  'batch',
  'batch/templates',
  'batch/templates/{id}',
  'batch/{id}',
  'batch/{id}/execute',
  'bc-grid/bcGrid',
  'code_tables',
  'code_tables/{codeHeaderName}',
  'context/databc/{wfs}',
  'context/elevation',
  'context/internal/{target}',
  'context/transform',
  'context/well',
  'deleted/activities',
  'email-settings',
  'email-templates',
  'embedded-report',
  'embedded-report/{reportId}',
  'employer_codes',
  'error',
  'export-config',
  'iapp-jurisdictions',
  'jurisdictions',
  'map-shaper',
  'media',
  'media/delete/{key}',
  'media/{key}',
  'metabase-query',
  'metabase-query/{queryId}',
  'misc/version',
  'points-of-interest',
  'points-of-interest-lean',
  'public-map/activities',
  'riso',
  'roles',
  'species',
  'training_videos',
  'update-request',
  'user-access',
  'v2/activities',
  'v2/iapp',
  'vectors/{source}/{z}/{x}/{y}'
];

export async function getAllPaths() {
  const loadedPaths: { path: string; module: any }[] = [];
  for (const path of PATHS_TO_LOAD) {
    loadedPaths.push({
      path: `/${path}`,
      module: await import(`paths/${path}`)
    });
  }
  return loadedPaths;
}
