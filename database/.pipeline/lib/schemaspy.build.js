'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

module.exports = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const oc = new OpenShiftClientX(Object.assign({ namespace: phases.build.namespace }, options));
  const phase = 'build';
  let objects = [];
  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift/tools'));

  // The building of your cool app goes here ▼▼▼
  const name = `${phases[phase].name}-schemaspy`;
  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/schemaspy.bc.json`, {
      param: {
        NAME: `${name}`,
        SUFFIX: `${phases[phase].suffix}`,
        VERSION: `${phases[phase].tag}`
      }
    })
  );

  oc.applyRecommendedLabels(objects, `${name}`, phase, phases[phase].changeId, phases[phase].instance);
  oc.applyAndBuild(objects);
};
