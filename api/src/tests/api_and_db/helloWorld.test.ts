import request from 'supertest';
import { expect } from 'chai';
import { describe } from 'mocha';
import { app, waitForAppReady } from 'app';

describe('Hello World', function () {
  before(async () => {
    await waitForAppReady();
  });
  
  it('should 401 on no auth', async () => {
    const response = await request(app).post('/activity').set('Content-type', 'application/json').send({});
    expect(response.status).to.equal(401);
  });
});
