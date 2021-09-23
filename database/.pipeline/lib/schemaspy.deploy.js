'use strict';
const { OpenShiftClientX } = require('pipeline-cli');
const path = require('path');

module.exports = (settings) => {
  const phases = settings.phases;
  const options = settings.options;
  const phase = options.env;

  const oc = new OpenShiftClientX(Object.assign({ namespace: phases[phase].namespace }, options));

  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, '../../openshift/tools'));

  const changeId = phases[phase].changeId || 'dev-tools';
  const instance = phases[phase].instance;
  const name = `${phases[phase].name}-schemaspy`;
  const host = `invasivebc-schemaspy-${changeId}-${phases[phase].namespace}.apps.silver.devops.gov.bc.ca`;

  const objects = [];

  objects.push(
    ...oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/schemaspy.dc.yaml`, {
      param: {
        NAME: `${name}`,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        APPLICATION_DOMAIN: host,
        BACKEND_HOST: phases[phase].host,
        DB_HOST: `${phases[phase].name}-postgresql${phases[phase].suffix}`,
        CHANGE_ID: phases.build.changeId || '0'
      }
    })
  );

  oc.applyRecommendedLabels(objects, name, phase, `${changeId}`, instance);
  oc.importImageStreams(objects, phases[phase].tag, phases.build.namespace, 'build-1.0.0-dev');
  oc.applyAndDeploy(objects, instance);
};
