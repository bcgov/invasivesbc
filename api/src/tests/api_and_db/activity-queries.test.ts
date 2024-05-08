// test stuff:
import { describe } from 'mocha';
import request from 'supertest';
import { app, waitForAppReady } from 'app';
import { BC_AREA, getShortActivityID } from 'sharedAPI';
import { faker } from '@faker-js/faker';
import random from 'geojson-random';
import { expect } from 'chai';

// activity stuff
import { v4 as uuidv4 } from 'uuid';

// @todo: Geojson factory
import bbox from '@turf/bbox';

const activityTypes = [
  {
    type: 'Observation',
    subtype: 'Activity_Observation_PlantTerrestrial'
  },
  {
    type: 'Treatment',
    subtype: 'Activity_Treatment_ChemicalPlantTerrestrial'
  },
  {
    type: 'Biocontrol',
    subtype: 'Activity_Biocontrol_Collection'
  },
  {
    type: 'Monitoring',
    subtype: 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant'
  }
];

// stuff to put in helpers:
export const template = {
  _id: '81b3051e-8c8f-41d0-ab5a-1407e6229364',
  short_id: '22PTO81B3',
  activity_id: '81b3051e-8c8f-41d0-ab5a-1407e6229364',
  activity_type: 'Observation',
  activity_subtype: 'Activity_Observation_PlantTerrestrial',
  geometry: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-127.752113, 53.936334],
            [-127.902832, 54.403545],
            [-126.446199, 55.14381],
            [-125.237875, 53.892555],
            [-125.974989, 51.761572],
            [-127.752113, 53.936334]
          ]
        ]
      }
    }
  ],
  created_timestamp: '2022-04-13T17:22:15-07:00',
  date_created: '2022-04-13T17:22:15-07:00',
  date_updated: null,
  form_data: { activity_data: { activity_date_time: '2022-04-13T17:22:15-07:00' } },
  created_by: 'mwwells@idir',
  user_role: [18],
  sync_status: 'Not Saved',
  form_status: 'Draft',
  review_status: 'Not Reviewed'
};

export const newRecord = () => {
  const id = uuidv4();
  const short_id = getShortActivityID({ ...template, _id: id, activity_id: id });
  const bc_geo = BC_AREA;
  const bc_bbox = bbox(bc_geo);
  const date = new Date().toISOString();
  const index = Math.floor(Math.random() * activityTypes.length);

  // 'normal' size
  const geo_array = random.polygon(1, 20, 0.001, bc_bbox).features;
  // jumbo
  //const geo_array = random.polygon(1, 20, 0.01, bc_bbox).features;
  console.log(JSON.stringify(geo_array));
  return JSON.stringify({
    ...template,
    _id: id,
    activity_id: id,
    short_id: short_id,
    geometry: geo_array,
    date_created: date,
    created_timestamp: date,
    form_data: { activity_data: { activity_date_time: date } },
    form_status: faker.helpers.arrayElement(['Draft', 'Submitted']),
    activity_type: activityTypes[index].type,
    activity_subtype: activityTypes[index].subtype
  });
};

describe.skip('can create activities', () => {
  before(async () => {
    await waitForAppReady();
  });
  
  it('should give 201 on create', async () => {
    const response = await request(app).post('/activity').set('Content-type', 'application/json').send(newRecord());
    expect(response.status).to.equal(201);
  });

  it('should be able to make 100 in a hurry', async () => {
    for (let i = 0; i < 200; i++) {
      const response = await request(app).post('/activity').set('Content-type', 'application/json').send(newRecord());
      expect(response.status).to.equal(201);
    }
  });
});
