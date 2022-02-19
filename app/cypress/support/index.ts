// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import { addBoard } from './commands/addBoard';
import { changeTheme, themeTextCheck } from './commands/themeTestCmds';
import { clickChildCheckbox, dragAccordion, toggleParentAccordion } from './commands/layerPickerTestCmds';
import moment from 'moment';
import { ActivityLetter } from 'constants/activities';
// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.Commands.add('addBoard', addBoard);
Cypress.Commands.add('changeTheme', changeTheme);
Cypress.Commands.add('clickChildCheckbox', clickChildCheckbox);
Cypress.Commands.add('dragAccordion', dragAccordion);
Cypress.Commands.add('themeTextCheck', themeTextCheck);
Cypress.Commands.add('toggleParentAccordion', toggleParentAccordion);

const snakeCase = (str) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const mapKeys = (source, mappingFunction) => {
  if (!source) return {};
  return Object.keys(source).reduce(
    (obj, key) => ({
      ...obj,
      [mappingFunction(key)]: source[key]
    }),
    {}
  );
};

export const getShortActivityID = (activity) => {
  const record: any = mapKeys(activity, snakeCase);
  if (!record?.activity_subtype || !record?.activity_id || !(record?.date_created || record.created_timestamp)) return;
  const shortYear = moment(record.date_created || record.created_timestamp)
    .format()
    .substr(2, 2);
  return shortYear + ActivityLetter[record.activity_subtype] + record.activity_id.substr(0, 4).toUpperCase();
};

export const yesNo = ['Yes', 'No'];

export const positiveNegative = ['positive{enter}', 'negative{enter}'];

export const jurisdictions = [
  'BC Hydro{enter}',
  'BC Rail{enter}',
  'British Columbia{enter}',
  'CN Rail{enter}',
  'CP Rail{enter}',
  'Department of F{enter}',
  'Department of N{enter}',
  'Department of T{enter}',
  'Enbridge{enter}',
  'Federal{enter}'
];
export const soilTextureArray = ['coarse{enter}', 'fine{enter}', 'medium{enter}', 'organic{enter}', 'unknown{enter}'];

export const slopeArray = [
  'ext{enter}',
  'flat 0{enter}',
  'gent{enter}',
  'mod{enter}',
  'near{enter}',
  'steep slope 3{enter}',
  'strong slope 1{enter}',
  'very stee{enter}',
  'very strong{enter}',
  'variable'
];
export const aspectArray = [
  'east{enter}',
  'north f{enter}',
  'northea{enter}',
  'northwe{enter}',
  'south f{enter}',
  'southe{enter}',
  'southw{enter}',
  'west f{enter}',
  'vari{enter}'
];

export const invasivePlants = [
  'african ru{enter}',
  'american{enter}',
  'annual ha{enter}',
  'annual so{enter}',
  'baby{enter}',
  'bache{enter}',
  'barn{enter}',
  'bighe{enter}',
  'garlic mustard{enter}',
  "old man's beard{enter}"
];

export const densityArray = ['1|{enter}', '2{enter}', '3{enter}', '4{enter}', 'Not{enter}', 'unknown{enter}'];

export const distributionArray = [
  '1|{enter}',
  '2{enter}',
  '3{enter}',
  '4{enter}',
  '5{enter}',
  '6{enter}',
  '7{enter}',
  '8{enter}',
  '9{enter}',
  'Not{enter}',
  'unknown{enter}'
];

export const lifeStageArray = [
  'de{enter}',
  'ju{enter}',
  'mature p{enter}',
  'disp{enter}',
  'fad{enter}',
  'flo{enter}',
  'im{enter}',
  'in b{enter}',
  'mature: m{enter}',
  'veg{enter}',
  'other{enter}',
  'plants a{enter}',
  'ros{enter}',
  'see{enter}',
  'sma{enter}',
  'unknown{enter}'
];

export const dateFormatter = (date: Date) => {
  const collectedYear = date.getFullYear().toString();
  var collectedMonth = date.getMonth().toString();
  var collectedDate = date.getDate().toString();
  if (collectedMonth === '0') collectedMonth = '1';
  if (collectedDate === '0') collectedDate = '1';
  return (
    collectedYear +
    '-' +
    (collectedMonth.length < 2 ? '0' : '') +
    collectedMonth +
    '-' +
    (collectedDate.length < 2 ? '0' : '') +
    collectedDate
  );
};
