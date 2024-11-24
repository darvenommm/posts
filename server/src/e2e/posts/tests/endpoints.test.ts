import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { default as request } from 'supertest';
import { HttpStatus } from 'http-enums';

import { getPostsDependencies } from '../settings';
import { createDTO, updateDTO } from '../testData';
import { addPost } from '../helpers';
import { addUser } from '@/e2e/auth/helpers';

import type { Express } from 'express';
import type { PoolClient } from 'pg';
import type { IDatabase } from '@/database';

describe('Posts endpoints', (): void => {
  let server: Express;
  let database: IDatabase;

  let connection: PoolClient;

  beforeAll(async (): Promise<void> => {
    const dependencies = await getPostsDependencies();

    server = dependencies.server;
    database = dependencies.database;
  });

  beforeEach(async (): Promise<void> => {
    connection = await database.getConnection();
  });

  afterEach(async (): Promise<void> => {
    database.releaseConnection(connection);
  });

  test('Test get one', async (): Promise<void> => {
    const { slug } = await addPost(server);

    const response = await request(server).get(`/posts/${slug}`);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.text).toBeDefined();
  });

  test('Test get page', async (): Promise<void> => {
    await addPost(server);

    const response = await request(server).get('/posts');

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.text).toBeDefined();
  });

  test('Test create', async (): Promise<void> => {
    const { sessionCookie } = await addUser(server);

    const response = await request(server)
      .post('/posts')
      .send(createDTO)
      .set('Cookie', sessionCookie);

    expect(response.status).toBe(HttpStatus.CREATED);
  });

  test('Test update', async (): Promise<void> => {
    const { slug, sessionCookie } = await addPost(server);

    const response = await request(server)
      .put(`/posts/${slug}`)
      .send(updateDTO)
      .set('Cookie', sessionCookie);

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.text).toBeDefined();
  });

  test('Test delete', async (): Promise<void> => {
    const { slug, sessionCookie } = await addPost(server);

    const response = await request(server).delete(`/posts/${slug}`).set('Cookie', sessionCookie);

    expect(response.status).toBe(HttpStatus.NO_CONTENT);
  });
});
