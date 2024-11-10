import { beforeAll, describe, test, expect, afterAll } from 'bun:test';
import { default as request } from 'supertest';

import { HttpStatus } from 'http-enums';

import { startTesting } from '../testHelpers';
import { addPostsDependenciesForTesting } from './addPostsDependencies';
import { signUpData } from '../auth';
import { addDTO, updateDTO } from './testData';

import type { Express } from 'express';
import type { TablesOwner } from '@/base/tablesOwner';
import type { PagesPaginationResult } from '@/domains/posts/types';

let server: Express;
let tablesOwner: TablesOwner;
let sessionCookie: string;
let postSlug: string;

describe('Posts endpoints', (): void => {
  beforeAll(async (): Promise<void> => {
    const dataForTesting = await startTesting(addPostsDependenciesForTesting);

    server = dataForTesting.server;
    tablesOwner = dataForTesting.tablesOwner;
  });

  afterAll(async (): Promise<void> => {
    await tablesOwner.clean();
  });

  test('Get posts without authentication', async (): Promise<void> => {
    const postsRequest = await request(server).get('/posts');
    expect(postsRequest.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  test('Get posts with authentication', async (): Promise<void> => {
    const response = await request(server).post('/auth/sign-up').send(signUpData);
    expect(response.status).toBe(HttpStatus.CREATED);

    const cookies = response.headers['set-cookie'] as unknown as string[];
    const session = cookies.find((cookie): boolean => cookie.startsWith('session'));
    expect(session).toBeDefined();

    sessionCookie = session!;

    const postsRequest = await request(server).get('/posts').set('Cookie', sessionCookie);
    expect(postsRequest.status).toBe(HttpStatus.OK);

    const postsData = JSON.parse(postsRequest.text) as PagesPaginationResult;
    expect(postsData.pagesCount).toBe(0);
    expect(postsData.posts).toBeEmpty();
  });

  test('Add post without authentication', async (): Promise<void> => {
    const addPostRequest = await request(server).post('/posts').send(addDTO);
    expect(addPostRequest.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  test('Add post with authentication', async (): Promise<void> => {
    // id is equal -> not create new
    for (let i = 0; i < 5; ++i) {
      const addPostRequest = await request(server)
        .post('/posts')
        .set('Cookie', sessionCookie)
        .send(addDTO);

      expect(addPostRequest.status).toBe(HttpStatus.CREATED);
    }

    const postsRequest = await request(server).get('/posts').set('Cookie', sessionCookie);
    expect(postsRequest.status).toBe(HttpStatus.OK);

    const postsData = JSON.parse(postsRequest.text) as PagesPaginationResult;
    expect(postsData.pagesCount).toBe(1);
    expect(postsData.posts).toHaveLength(1);

    postSlug = postsData.posts[0].slug;
  });

  test('Update post without authentication', async (): Promise<void> => {
    const updatePostRequest = await request(server).put(`/posts/${postSlug}`).send(updateDTO);
    expect(updatePostRequest.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  test('Update post with authentication', async (): Promise<void> => {
    const updatePostRequest = await request(server)
      .put(`/posts/${postSlug}`)
      .set('Cookie', sessionCookie)
      .send(updateDTO);

    expect(updatePostRequest.status).toBe(HttpStatus.NO_CONTENT);

    const postsRequest = await request(server).get('/posts').set('Cookie', sessionCookie);
    expect(postsRequest.status).toBe(HttpStatus.OK);

    const postsData = JSON.parse(postsRequest.text) as PagesPaginationResult;
    expect(postsData.pagesCount).toBe(1);
    expect(postsData.posts).toHaveLength(1);

    // new slug because of updating title
    postSlug = postsData.posts[0].slug;
  });

  test('Delete post without authentication', async (): Promise<void> => {
    const deletePostRequest = await request(server).delete(`/posts/${postSlug}`);
    expect(deletePostRequest.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  test('Delete post with authentication', async (): Promise<void> => {
    const deletePostRequest = await request(server)
      .delete(`/posts/${postSlug}`)
      .set('Cookie', sessionCookie);

    expect(deletePostRequest.status).toBe(HttpStatus.NO_CONTENT);

    const postsRequest = await request(server).get('/posts').set('Cookie', sessionCookie);
    expect(postsRequest.status).toBe(HttpStatus.OK);

    const postsData = JSON.parse(postsRequest.text) as PagesPaginationResult;
    expect(postsData.pagesCount).toBe(0);
    expect(postsData.posts).toBeEmpty();
  });
});
