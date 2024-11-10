import { beforeAll, describe, test, expect, afterAll } from 'bun:test';
import { default as request } from 'supertest';

import { HttpStatus } from 'http-enums';

import { IS_AUTHENTICATED_GUARD } from '@/domains/auth';
import { startTesting } from '../testHelpers';
import { addAuthDependenciesForTesting } from './addAuthDependencies';
import { signUpData } from './testData';

import type { Request, Response, Express } from 'express';
import type { TablesOwner } from '@/base/tablesOwner';
import type { Guard } from '@/base/guard';

let server: Express;
let tablesOwner: TablesOwner;

const IS_AUTHENTICATED_GUARD_PATH = '/test-guard';

describe('Auth guards', (): void => {
  beforeAll(async (): Promise<void> => {
    const dataForTesting = await startTesting(addAuthDependenciesForTesting);

    server = dataForTesting.server;
    tablesOwner = dataForTesting.tablesOwner;

    const isAuthenticatedGuard = dataForTesting.container.resolve<Guard>(IS_AUTHENTICATED_GUARD);

    server.use(
      IS_AUTHENTICATED_GUARD_PATH,
      isAuthenticatedGuard.getGuard(),
      (_: Request, response: Response): void => {
        response.end();
      },
    );
  });

  afterAll(async (): Promise<void> => {
    server._router.stack = server._router.stack.filter((layer: any): boolean => {
      return !(layer.route && layer.route.path === IS_AUTHENTICATED_GUARD_PATH);
    });

    await tablesOwner.clean();
  });

  test('isAuthenticated guard when user is not authenticated', async (): Promise<void> => {
    const guardRequest = await request(server).get(IS_AUTHENTICATED_GUARD_PATH);

    expect(guardRequest.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  test('isAuthenticated guard when user is authenticated', async (): Promise<void> => {
    const signUpResponse = await request(server).post('/auth/sign-up').send(signUpData);

    const cookies = signUpResponse.headers['set-cookie'] as unknown as string[];
    const sessionCookie = cookies.find((cookie): boolean => cookie.startsWith('session'));
    expect(sessionCookie).toBeDefined();

    const guardRequest = await request(server)
      .get(IS_AUTHENTICATED_GUARD_PATH)
      .set('Cookie', sessionCookie!);

    expect(guardRequest.status).not.toBe(HttpStatus.UNAUTHORIZED);
  });
});
