'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const wait = require('./wait');
const checkAndClean = require('./checkAndClean');
const path = require('path');

module.exports = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));

  const changeId = phases[phase].changeId;
  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));

  const objects = [];
  const imageStreams = [];

  const isName = `${phases[phase].name}-setup`;
  const isVersion = `${phases[phase].tag}`;

  const imageStreamName = `${isName}:${isVersion}`;

  const instance = `${isName}-${changeId}`;

  // Clean existing image
  checkAndClean(`istag/${imageStreamName}`, oc);

  // Creating image stream for setup
  imageStreams.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.is.yaml`, {
      param: {
        NAME: `${isName}`
      }
    })
  );

  oc.applyRecommendedLabels(imageStreams, phases[phase].name, phase, `${changeId}`, instance);
  oc.importImageStreams(imageStreams, isVersion, phases.build.namespace, phases.build.tag);

  // Get API image stream
  const fetchedImageStreams = oc.get(`istag/${imageStreamName}`) || [];

  if (!fetchedImageStreams.length) {
    console.log('Unable to fetch Database image reference for use in database setup deployment');
    process.exit(0);
  }

  const dbSetupImageStream = fetchedImageStreams[0];

  const dbSetupPodName = `${phases[phase].name}-postgresql${phases[phase].suffix}-setup`;

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.setup.deploy.yaml`, {
      param: {
        NAME: dbSetupPodName,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        CHANGE_ID: changeId,
        ENVIRONMENT: phases[phase].env || 'dev',
        DB_SERVICE_NAME: `${phases[phase].name}-postgresql${phases[phase].suffix}`,
        IMAGE: dbSetupImageStream.image.dockerImageReference,
        DB_MIGRATION_TYPE: phases[phase].migrationInfo.type,
        DB_CLEAN_UP: phases[phase].migrationInfo.cleanup,
        DB_SEED: phases[phase].migrationInfo.dbSeed
      }
    })
  );

  checkAndClean(`pod/${dbSetupPodName}`, oc);

  oc.applyRecommendedLabels(objects, phases[phase].name, phase, `${changeId}`, instance);
  oc.applyAndDeploy(objects, phases[phase].instance);

  wait(`pod/${dbSetupPodName}`, settings, 30);
};
