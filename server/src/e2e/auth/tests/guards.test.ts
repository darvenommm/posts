import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { default as request } from 'supertest';
import { v4 as createUUID } from 'uuid';
import { HttpStatus } from 'http-enums';

import { IS_AUTHENTICATED_GUARD } from '@/domains/auth';
import { getAuthDependencies } from '../settings';
import { addUser } from '../helpers';

import type { Express, Request, Response } from 'express';
import type { PoolClient } from 'pg';
import type { IDatabase } from '@/database';
import type { Guard } from '@/base/guard';

describe('Auth guards', (): void => {
  const IS_AUTH_GUARD_PATH = `/test-path/${createUUID()}`;

  let server: Express;
  let database: IDatabase;

  let connection: PoolClient;

  beforeAll(async (): Promise<void> => {
    const dependencies = await getAuthDependencies();

    server = dependencies.server;
    database = dependencies.database;
    const isAuthGuard = dependencies.container.get<Guard>(IS_AUTHENTICATED_GUARD);

    server.get(
      IS_AUTH_GUARD_PATH,
      isAuthGuard.getGuard(),
      (_: Request, response: Response<void>) => {
        response.status(HttpStatus.NO_CONTENT).end();
      },
    );
  });

  beforeEach(async (): Promise<void> => {
    connection = await database.getConnection();
  });

  afterEach(async (): Promise<void> => {
    database.releaseConnection(connection);
  });

  test('Test auth guard', async (): Promise<void> => {
    const { sessionCookie } = await addUser(server);

    const notAuthResponse = await request(server).get(IS_AUTH_GUARD_PATH);
    expect(notAuthResponse.status).toBe(HttpStatus.UNAUTHORIZED);

    const authResponse = await request(server).get(IS_AUTH_GUARD_PATH).set('Cookie', sessionCookie);
    expect(authResponse.status).toBe(HttpStatus.NO_CONTENT);
  });
});
