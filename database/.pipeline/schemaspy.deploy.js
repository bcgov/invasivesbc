'use strict';
const deploySchemaspyTask = require('./lib/schemaspy.deploy.js');
const config = require('./config.js');

const settings = { ...config, phase: settings.options.env };

// deploy schemaspy
deploySchemaspyTask(settings);
