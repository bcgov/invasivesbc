'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

module.exports = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;
  const changeId = phases[phase].changeId;
  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));
  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift'));
  var objects = [];

  // The deployment of your cool app goes here ▼▼▼
  const name = `${phases[phase].name}-db`;
  const instance = `${phases[phase].instance}`;
  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/db.dc.yaml`, {
      param: {
        NAME: name,
        DATABASE_SERVICE_NAME: `${phases[phase].name}-postgresql${phases[phase].suffix}`,
        IMAGE_STREAM_NAME: name,
        IMAGE_STREAM_VERSION: phases.build.tag,
        POSTGRESQL_DATABASE: 'InvasiveBC',
        IMAGE_STREAM_NAMESPACE: phases.build.namespace,
        VOLUME_CAPACITY:
          `${phases[phase].name}-postgresql${phases[phase].suffix}` == 'invasivesbc-api-postgresql-dev-deploy'
            ? '20Gi'
            : '3Gi'
      }
    })
  );

  oc.applyRecommendedLabels(objects, name, phase, `${changeId}`, instance);
  oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, phases.build.tag);
  oc.applyAndDeploy(objects, instance);
};
