'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

module.exports = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = 'build';

  // temporary hack
  const targetEnv = phases[phase].branch || 'dev';

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases.build.namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));

  let objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/app.bc.yaml`, {
      param: {
        NAME: phases[phase].name,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        REACT_APP_API_HOST: phases[targetEnv].apiHost,
        ENVIRONMENT: phases[phase].env || 'dev',
        SSO_URL: phases[targetEnv].sso.url,
        SSO_CLIENT_ID: phases[targetEnv].sso.clientId,
        SSO_REALM: phases[targetEnv].sso.realm,
        REDIRECT_URI: phases[targetEnv].sso.redirect,
        SOURCE_REPOSITORY_URL: oc.git.http_url,
        SOURCE_REPOSITORY_REF: phases[phase].branch || oc.git.ref
      }
    })
  );

  oc.applyRecommendedLabels(objects, phases[phase].name, phase, phases[phase].changeId, phases[phase].instance);
  console.log(`${JSON.stringify(objects, null, 2)}`);
  oc.applyAndBuild(objects);
};
