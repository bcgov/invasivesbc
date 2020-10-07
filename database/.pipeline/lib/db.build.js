'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

module.exports = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const oc = new OpenShiftClientX(Object.assign({ namespace: phases.build.namespace }, options));
  const phase = 'build';
  let objects = [];
  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));

  const name = `${phases[phase].name}-db`;
  // The building of your cool app goes here ▼▼▼
  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.bc.yaml`, {
      param: {
        NAME: `${name}`,
        NAME_SUFFIX: `${phases[phase].suffix}`,
        TAG_NAME: `${phases[phase].tag}`
      }
    })
  );

  oc.applyRecommendedLabels(objects, `${name}`, phase, phases[phase].changeId, phases[phase].instance);
  oc.applyAndBuild(objects);
};
