'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

module.exports = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = 'build';

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases.build.namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));

  let objects = [];

  let real_node_env;
  switch (phases[phase].branch) {
    case 'dev':
      real_node_env = 'development';
      break;
    case 'test':
      real_node_env = 'test';
      break;
    case 'prod':
      real_node_env = 'production';
      break;
    default:
      real_node_env = 'development';
  }
  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/app.bc.yaml`, {
      param: {
        NAME: phases[phase].name,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        REACT_APP_REAL_NODE_ENV: real_node_env,
        SOURCE_REPOSITORY_URL: oc.git.http_url,
        SOURCE_REPOSITORY_REF: phases[phase].branch || oc.git.ref
      }
    })
  );

  oc.applyRecommendedLabels(objects, phases[phase].name, phase, phases[phase].changeId, phases[phase].instance);
  console.log(`${JSON.stringify(objects, null, 2)}`);
  oc.applyAndBuild(objects);
};
