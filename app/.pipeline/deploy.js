'use strict';
const config = require('./lib/config.js');
const deployTask = require('./lib/deploy.js');

const settings = { ...config, phase: settings.options.env };

deployTask(settings);
