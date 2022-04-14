import { expect } from 'chai';
import { describe } from 'mocha';

import request from 'supertest';
require('dotenv').config({ path: './env_config/env.local', debug: true });
import { app } from '../../src/app';

import { v4 as uuidv4 } from 'uuid';
import path from 'path';

describe('can create activities', () => {
  it('should give 201 on create', async () => {
    let template = {
      _id: '81b3051e-8c8f-41d0-ab5a-1407e6229364',
      short_id: '22PTO81B3',
      activity_id: '81b3051e-8c8f-41d0-ab5a-1407e6229364',
      activity_type: 'Observation',
      activity_subtype: 'Activity_Observation_PlantTerrestrial',
      geometry: null,
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

    const newRecord = () => {
      const id = uuidv4();
      return JSON.stringify({ ...template, _id: id, activity_id: id });
    };

    // post logs that wrong env var used:
    const response = await request(app).post('/activity').set('Content-type', 'application/json').send(newRecord());

    console.log(process.env.SECURITY_ON);
    const actual = response.body;
    expect(actual.code).to.equal(201);
  });
});
