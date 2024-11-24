import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { default as request } from 'supertest';
import { HttpStatus } from 'http-enums';

import { getAuthDependencies } from '../settings';
import { signInDTO, signUpDTO } from '../testData';
import { addUser } from '../helpers';

import type { Express } from 'express';
import type { PoolClient } from 'pg';
import type { IDatabase } from '@/database';

describe('Auth endpoints', (): void => {
  let server: Express;
  let database: IDatabase;

  let connection: PoolClient;

  beforeAll(async (): Promise<void> => {
    const dependencies = await getAuthDependencies();

    server = dependencies.server;
    database = dependencies.database;
  });

  beforeEach(async (): Promise<void> => {
    connection = await database.getConnection();
  });

  afterEach(async (): Promise<void> => {
    database.releaseConnection(connection);
  });

  test('Test sign up', async (): Promise<void> => {
    const response = await request(server).post('/auth/sign-up').send(signUpDTO);

    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  test('Test sign in', async (): Promise<void> => {
    await request(server).post('/auth/sign-up').send(signUpDTO);
    const response = await request(server).post('/auth/sign-in').send(signInDTO);

    expect(response.status).toBe(HttpStatus.NO_CONTENT);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  test('Test sign out', async (): Promise<void> => {
    const response = await request(server).post('/auth/sign-out').send(signUpDTO);

    expect(response.status).toBe(HttpStatus.NO_CONTENT);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  test('Test isAuth', async (): Promise<void> => {
    const { sessionCookie } = await addUser(server);

    const isNotAuthResponse = await request(server).get('/auth/is-auth');
    expect(isNotAuthResponse.text).toBe('false');

    const isAuthResponse = await request(server).get('/auth/is-auth').set('Cookie', sessionCookie);
    expect(isAuthResponse.text).toBe('true');
  });
});
