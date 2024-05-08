import { describe } from 'mocha';

import request from 'supertest';
import { app, waitForAppReady } from 'app';
import { expect } from 'chai';

describe('API starts', () => {
  before(async () => {
    await waitForAppReady();
  });

  it('should respond to version GET', async () => {
    const response = await request(app).get('/misc/version');
    const actual = response.body.message;
    expect(actual).to.equal('Got version info');
  });
});
