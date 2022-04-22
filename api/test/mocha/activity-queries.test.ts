// test stuff:
import { expect } from 'chai';
import { describe } from 'mocha';
import request from 'supertest';

// needs to be in this order:
require('dotenv').config({ path: './env_config/env.local', debug: false });
import { app } from '../../src/app';
import faker from '@faker-js/faker';

// activity stuff
import { v4 as uuidv4 } from 'uuid';
//import '../../../app/src/constants';
import '../../../app/src/constants/database';
import '../../../app/src/constants/activities';
import * as addActivity from '../../../app/src/utils/addActivity';
// todo:
import fake, { JsonSchema } from 'typescript-json-schema-faker';
// Geojson factory
import bbox from '@turf/bbox';
var random = require('geojson-random');

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
  const short_id = addActivity.getShortActivityID({ ...template, _id: id, activity_id: id });
  const bc_geo = require('../../../app/src/components/map/BC_AREA.json');
  const bc_bbox = bbox(bc_geo);
  const date = new Date().toISOString();

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
    form_status: faker.random.boolean() ? 'Draft' : 'Submitted'
  });
};

describe('can create activities', () => {
  it('should give 201 on create', async () => {
    const response = await request(app).post('/activity').set('Content-type', 'application/json').send(newRecord());
    const actual = response.body;
    expect(actual.code).to.equal(201);
  });

  it('should be able to make 100 in a hurry', async () => {
    for (let i = 0; i < 1001; i++) {
      const response = await await request(app)
        .post('/activity')
        .set('Content-type', 'application/json')
        .send(newRecord());
      const actual = response.body;
      expect(actual.code).to.equal(201);
    }
  });
});
