'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

/**
 * Run a pod to build the database image stream.
 *
 * @param {*} settings
 */
module.exports = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = 'build';

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases.build.namespace }, options));

  const dbName = `${phases[phase].dbName}`;
  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.bc.yaml`, {
      param: {
        NAME: `${dbName}`,
        NAME_SUFFIX: `${phases[phase].suffix}`,
        TAG_NAME: `${phases[phase].tag}`
      }
    })
  );

  oc.applyRecommendedLabels(objects, `${dbName}`, phase, phases[phase].changeId, phases[phase].instance);
  oc.applyAndBuild(objects);
};
