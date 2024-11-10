import { beforeAll, describe, test, expect, afterAll } from 'bun:test';
import { default as request } from 'supertest';

import { HttpStatus } from 'http-enums';

import { startTesting } from '../testHelpers';
import { addPostsDependenciesForTesting } from './addPostsDependencies';
import { addDTO, updateDTO } from './testData';
import { TEXT_CONSTRAINTS, TITLE_CONSTRAINTS } from '@/domains/posts';
import { signUpData } from '../auth';

import type { Express } from 'express';
import type { TablesOwner } from '@/base/tablesOwner';
import type { PagesPaginationResult } from '@/domains/posts/types';

let server: Express;
let tablesOwner: TablesOwner;
let sessionCookie: string;
let postSlug: string;

const shortTitle = Array.from({ length: TITLE_CONSTRAINTS.minLength - 1 })
  .map((): string => 'a')
  .join('');

const longTitle = Array.from({ length: TITLE_CONSTRAINTS.maxLength + 1 })
  .map((): string => 'a')
  .join('');

const longText = Array.from({ length: TEXT_CONSTRAINTS.maxLength + 1 })
  .map((): string => 'a')
  .join('');

describe('Posts endpoints', async (): Promise<void> => {
  beforeAll(async (): Promise<void> => {
    const dataForTesting = await startTesting(addPostsDependenciesForTesting);

    server = dataForTesting.server;
    tablesOwner = dataForTesting.tablesOwner;

    const response = await request(server).post('/auth/sign-up').send(signUpData);
    expect(response.status).toBe(HttpStatus.CREATED);

    const cookies = response.headers['set-cookie'] as unknown as string[];
    const session = cookies.find((cookie): boolean => cookie.startsWith('session'));
    expect(session).toBeDefined();

    sessionCookie = session!;

    const addPostRequest = await request(server)
      .post('/posts')
      .set('Cookie', sessionCookie)
      .send(addDTO);

    expect(addPostRequest.status).toBe(HttpStatus.CREATED);

    const postsRequest = await request(server).get('/posts').set('Cookie', sessionCookie);
    expect(postsRequest.status).toBe(HttpStatus.OK);

    const postsData = JSON.parse(postsRequest.text) as PagesPaginationResult;
    expect(postsData.pagesCount).toBe(1);
    expect(postsData.posts).toHaveLength(1);

    postSlug = postsData.posts[0].slug;
  });

  afterAll(async (): Promise<void> => {
    await tablesOwner.clean();
  });

  test('Add post incorrect id', async (): Promise<void> => {
    const response = await request(server)
      .post('/posts')
      .send({ ...addDTO, id: 'df' })
      .set('Cookie', sessionCookie);
    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  test('Add post incorrect title', async (): Promise<void> => {
    const responseShortTitle = await request(server)
      .post('/posts')
      .send({ ...addDTO, title: shortTitle })
      .set('Cookie', sessionCookie);
    expect(responseShortTitle.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    const responseLongTitle = await request(server)
      .post('/posts')
      .send({ ...addDTO, title: longTitle })
      .set('Cookie', sessionCookie);
    expect(responseLongTitle.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  test('Add post incorrect text', async (): Promise<void> => {
    const responseLongText = await request(server)
      .post('/posts')
      .send({ ...addDTO, text: longText })
      .set('Cookie', sessionCookie);
    expect(responseLongText.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  test('Update post incorrect title', async (): Promise<void> => {
    const updateRequestShortTitle = await request(server)
      .put(`/posts/${postSlug}`)
      .send({ ...addDTO, title: shortTitle })
      .set('Cookie', sessionCookie);
    expect(updateRequestShortTitle.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    const updateRequestLongTitle = await request(server)
      .put(`/posts/${postSlug}`)
      .send({ ...addDTO, title: longTitle })
      .set('Cookie', sessionCookie);
    expect(updateRequestLongTitle.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  test('Update post incorrect text', async (): Promise<void> => {
    const updateRequestLongText = await request(server)
      .put(`/posts/${postSlug}`)
      .send({ ...addDTO, text: longText })
      .set('Cookie', sessionCookie);
    expect(updateRequestLongText.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  test('Get posts incorrect page', async (): Promise<void> => {
    const responseZero = await request(server)
      .get('/posts')
      .set('Cookie', sessionCookie)
      .query({ page: 0 });
    expect(responseZero.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    const responseNegative = await request(server)
      .get('/posts')
      .set('Cookie', sessionCookie)
      .query({ page: -10 });
    expect(responseNegative.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  test('Get posts incorrect limit', async (): Promise<void> => {
    const responseZero = await request(server)
      .get('/posts')
      .set('Cookie', sessionCookie)
      .query({ limit: 0 });
    expect(responseZero.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    const responseNegative = await request(server)
      .get('/posts')
      .set('Cookie', sessionCookie)
      .query({ limit: -10 });
    expect(responseNegative.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });
});
