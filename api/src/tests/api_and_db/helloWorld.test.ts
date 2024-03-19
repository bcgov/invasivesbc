import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

describe('Hello World', function () {
  beforeAll(async () => {});

  it('should 401 on no auth', async () => {
    const response = await request(app).post('/activity').set('Content-type', 'application/json').send({});
    const actual = response.body;
    expect(actual.code).to.equal(400);
  });
});
