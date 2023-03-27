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
const { faker } = require('@faker-js/faker');
// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.Commands.add('addBoard', addBoard);
Cypress.Commands.add('changeTheme', changeTheme);
Cypress.Commands.add('clickChildCheckbox', clickChildCheckbox);
Cypress.Commands.add('dragAccordion', dragAccordion);
Cypress.Commands.add('themeTextCheck', themeTextCheck);
Cypress.Commands.add('toggleParentAccordion', toggleParentAccordion);

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
  'variable{enter}'
];

export const specficUses = [
  'None',
  'Unknown',
  'Gravel pit',
  'No-spray zone',
  'Numbered highway',
  'Parking lot',
  'Rec site/trail',
  'Rest area',
  'Sensitive site',
  'Transfer station/landfill',
  'Within PFZ',
  'Within PFZ - water body',
  'Within PFZ - well',
  'Yard / ditching waste dump',
  'Quarry',
  'Railway',
  'Transmission line',
  'Cultivated land',
  'Research site',
  'Reservoir',
  'Mine site',
  'Mine tailings',
  'Burn scar',
  'Industrial site',
  'Community pasture'
];

export const aspectArray = [
  'north f{enter}',
  'northeast f{enter}',
  'northwest f{enter}',
  'south f{enter}',
  'southeast f{enter}',
  'southwest f{enter}',
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

export const densityArray = ['1|{enter}', '2|{enter}', '3|{enter}', '4|{enter}', 'Not{enter}', 'unknown{enter}'];

export const distributionArray = [
  '1|{enter}',
  '2|{enter}',
  '3|{enter}',
  '4|{enter}',
  '5|{enter}',
  '6|{enter}',
  '7|{enter}',
  '8|{enter}',
  '9|{enter}',
  'Not{enter}',
  'unknown{enter}'
];

export const projectCodeDescription = [
  'Cool Code',
  'Crab Code',
  'WVDRIVE2',
  'CLEAN',
  'RM214',
  'MOT_PREASPATOU',
  'PRRD_SWS'
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

export const commentArray = [
  'The plants are not cool here',
  'Brian was here',
  'Could not find the Crab Game',
  'Entire area was treaated due to a complaint',
  'Pit location and parcel boundaries can be found online',
  'Soil and gravel has been moved around to a great extent in this area',
  'East side of highway',
  'North side of highway',
  'Someone keeps moving the ketchup bottle'
];

export const accessDescriptionArray = [
  'Only cool people allowed',
  'Jeff only zone',
  'Privately accessed zone',
  'Publicly accessed zone'
];

export const locationDescriptionArray = [
  'Downtown New Mombasa',
  'On top of Hasty Hill',
  'Mostly flat area',
  'The floor is lava',
  'Near a watershed on a hill',
  'Urban area with high traffic'
];

export const nameArray = ['Hat King', faker.name.findName()];

export const pestManagementPlans = [
  'FLNR PMP 402-0680-20/25 [Central and Northern BC]{enter}',
  'FLNR-PMP 402-0677-19/24 [South Coastal Region of BC]{enter}',
  'FLNR-PMP 402-0678-19/24 [Southern Interior of BC]{enter}',
  'MOTI PMP 102-0671-21-26 [South Coastal Mainland of BC]{enter}'
];

export const windDirectionArray = [
  'N {enter}',
  'NE {enter}',
  ' E{enter}',
  'SE {enter}',
  'S {enter}',
  'SW {enter}',
  'NW {enter}'
];

export const humidityArray = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export const chemApplicationMethods = [
  'ATX{enter}',
  'Back Pack{enter}',
  'Boomless Nozzle{enter}',
  'Fixed Boom{enter}',
  'Hand Gun{enter}',
  'Basal Bark{enter}',
  'Cut Stump / Cut and Paint{enter}',
  'Cut and Insert{enter}',
  'Stem Injection{enter}',
  'Wick{enter}'
];

export const herbicideTypes = ['granular{enter}', 'liquid{enter}'];

export const herbicideLiquids = [
  'AM500a [2,4-D 2,4-D Amine 500] 14725{enter}',
  'AM500b [2,4-D 2,4-D Amine 500] 9528{enter}',
  'AM600a [2,4-D 2,4-D Amine 600] 5931{enter}',
  'AM600b [2,4-D 2,4-D Amine 600] 14726{enter}',
  'Arsenal Powerline [imazapyr] 30203{enter}',
  'Arsenal [imazapyr] 23713{enter}',
  'Aspect [picloram/2,4-D] 31641{enter}',
  'Banvel II [dicamba] 23957{enter}'
];

export const herbicideGranulars = [
  'Clearview [aminopyralid/metsulfuron-methyl] 29752{enter}',
  'Escort [metsulfuron methyl] 23005{enter}',
  'LongRun [flazasulfuron] 33128{enter}',
  'Method50SG [aminocyclopyrachlor] 30917{enter}',
  'Navius Flex [metsulfuron-methyl/aminocyclopyrachlor] 30922{enter}',
  'NaviusVM [metsulfuron-methyl/Aminocyclopyrachlor] 31382{enter}',
  'Overdrive [diflufenzopyr] 30065{enter}'
];

export const herbicideCalculationTypes = ['Dilution{enter}', 'Product Application Rate{enter}'];

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
