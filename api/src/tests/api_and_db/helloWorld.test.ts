import request from 'supertest';
import { expect } from 'chai';
import { describe } from 'mocha';
import { app } from 'app';

describe('Hello World', function () {
  it('should 401 on no auth', async () => {
    const response = await request(app).post('/activity').set('Content-type', 'application/json').send({});
    expect(response.status).to.equal(401);
  });
});
