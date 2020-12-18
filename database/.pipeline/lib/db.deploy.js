'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

/**
 * Run a pod to deploy the database image (must be already built, see db.build.js).
 *
 * @param {*} settings
 * @returns
 */
module.exports = (settings) => {
  try {
    const phases = settings.phases;
    const options = settings.options;
    const phase = options.env;

    console.log('Test 1');
    const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));
    console.log('Test 2');
    const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));
    console.log('Test 3');
    const name = `${phases[phase].name}`;
    const instance = `${phases[phase].instance}`;
    const changeId = `${phases[phase].changeId}`;

    const objects = [];
    console.log('Test 4');
    objects.push(
      ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.dc.yaml`, {
        param: {
          NAME: name,
          DATABASE_SERVICE_NAME: `${name}-postgresql${phases[phase].suffix}`,
          IMAGE_STREAM_NAME: name,
          IMAGE_STREAM_VERSION: phases.build.tag,
          POSTGRESQL_DATABASE: 'InvasivesBC',
          IMAGE_STREAM_NAMESPACE: phases.build.namespace,
          VOLUME_CAPACITY:
            `${name}-postgresql${phases[phase].suffix}` === `${name}-postgresql-dev-deploy` ? '20Gi' : '3Gi'
        }
      })
    );
    console.log(JSON.stringify(objects));
    console.log('Test 5');
    oc.applyRecommendedLabels(objects, name, phase, changeId, instance);
    console.log(JSON.stringify(objects));
    console.log('Test 6');
    oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, phases.build.tag);
    console.log(JSON.stringify(objects));
    console.log('Test 7');
    oc.applyAndDeploy(objects, instance);
    console.log('Test 8');
  } catch (error) {
    console.log(error);
    console.log('Test 9');
  }
};
