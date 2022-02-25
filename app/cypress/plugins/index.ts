/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const pg = require('pg');
const fs = require('fs-extra');
const path = require('path');

function getConfigurationByFile(file) {
  const pathToConfigFile = path.resolve('..', 'app', 'cypress', 'config', `${file}.json`);

  return fs.readJson(pathToConfigFile);
}

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  const file = config.env.configFile || 'local';

  on('task', {
    DATABASE({ dbConfig, sql, values }) {
      const pool = new pg.Pool(dbConfig);
      try {
        return pool.query(sql, values);
      } catch (e) {
        console.log('error', e);
      }
    }
  });

  return getConfigurationByFile(file);
};

export {};
