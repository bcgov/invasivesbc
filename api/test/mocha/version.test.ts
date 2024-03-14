import { expect } from 'chai';
import { describe } from 'mocha';

import request from 'supertest';
import { app } from '../../src/app.js';

describe('API starts', () => {
  it('should respond to version GET', async () => {
    const response = await request(app).get('/misc/version');
    const actual = response.body.message;
    expect(actual).to.equal('Got version info');
  });
});
