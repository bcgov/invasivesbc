'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const wait = require('./wait');
const checkAndClean = require('./checkAndClean');
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
  const migrateTag = `${phases[phase].tag}-migrate`;
  const image = `${isName}:${migrateTag}`;

  // Clean existing image
  checkAndClean(`istag/${image}`, oc);

  // Creating image stream for migrate
  is.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/is.api.yaml`, {
      param: {
        NAME: `${isName}`
      }
    })
  );

  oc.applyRecommendedLabels(is, phases[phase].name, phase, `${changeId}`, instance);
  oc.importImageStreams(is, migrateTag, phases.build.namespace, phases.build.tag);

  // Get API image stream
  const data = oc.get(`istag/${image}`) || [];
  if (data.length === 0) {
    console.log('Unable to fetch API imag ref');
    process.exit(0);
  }
  const imageStream = data[0];
  const podName = `${phases[phase].name}${phases[phase].suffix}-migrate`;

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/migrate.pod.yaml`, {
      param: {
        NAME: podName,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        CHANGE_ID: phases[phase].changeId,
        ENVIRONMENT: phases[phase].env || 'dev',
        DB_SERVICE_NAME: `${phases[phase].name}-postgresql${phases[phase].suffix}`,
        IMAGE: imageStream.image.dockerImageReference,
        DB_MIGRATION_TYPE: phases[phase].migrationInfo.type,
        DB_CLEAN_UP: phases[phase].migrationInfo.cleanup,
        DB_SEED: phases[phase].migrationInfo.dbSeed
      }
    })
  );
  checkAndClean(`pod/${podName}`, oc);
  oc.applyRecommendedLabels(objects, phases[phase].name, phase, `${changeId}`, instance);
  oc.applyAndDeploy(objects, phases[phase].instance);
  wait(`pod/${podName}`, settings, 30);
};
