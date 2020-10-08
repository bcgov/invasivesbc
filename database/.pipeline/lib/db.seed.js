'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const wait = require('../utils/wait');
const checkAndClean = require('../utils/checkAndClean');
const path = require('path');

module.exports = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;
  const changeId = phases[phase].changeId;
  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));
  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));
  var objects = [];
  var is = [];

  // The deployment of your cool app goes here ▼▼▼
  const isName = `${phases[phase].name}`;
  const instance = `${isName}-${changeId}`;
  const seedTag = `${phases[phase].tag}-seed`;
  const image = `${isName}:${seedTag}`;

  // Clean existing image
  checkAndClean(`istag/${image}`, oc);

  // Creating image stream for seed
  is.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/is.api.yaml`, {
      param: {
        NAME: `${isName}`
      }
    })
  );

  oc.applyRecommendedLabels(is, phases[phase].name, phase, `${changeId}`, instance);
  oc.importImageStreams(is, seedTag, phases.build.namespace, phases.build.tag);

  // Get API image stream
  const data = oc.get(`istag/${image}`) || [];
  if (data.length === 0) {
    console.log('Unable to fetch API imag ref');
    process.exit(0);
  }
  const imageStream = data[0];
  const podName = `${phases[phase].name}${phases[phase].suffix}-seed`;

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/seed.pod.yaml`, {
      param: {
        NAME: podName,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        CHANGE_ID: phases[phase].changeId,
        ENVIRONMENT: phases[phase].env || 'dev',
        DB_SERVICE_NAME: `${phases[phase].name}-postgresql${phases[phase].suffix}`,
        IMAGE: imageStream.image.dockerImageReference
      }
    })
  );
  checkAndClean(`pod/${podName}`, oc);
  oc.applyRecommendedLabels(objects, phases[phase].name, phase, `${changeId}`, instance);
  oc.applyAndDeploy(objects, phases[phase].instance);
  wait(`pod/${podName}`, settings, 30);
};
