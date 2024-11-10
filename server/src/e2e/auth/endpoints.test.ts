import { beforeAll, describe, test, expect, afterAll } from 'bun:test';
import { default as request } from 'supertest';

import { HttpStatus } from 'http-enums';

import { ADMIN_SETTINGS, type IAdminSettings } from '@/settings/admin';
import { startTesting } from '../testHelpers';
import { addAuthDependenciesForTesting } from './addAuthDependencies';
import { signInData, signUpData } from './testData';

import type { Express } from 'express';
import type { TablesOwner } from '@/base/tablesOwner';
import type { SignInDTO } from '@/domains/auth/dtos';

let server: Express;
let tablesOwner: TablesOwner;
let adminSettings: IAdminSettings;

describe('Auth endpoints', (): void => {
  beforeAll(async (): Promise<void> => {
    const dataForTesting = await startTesting(addAuthDependenciesForTesting);

    server = dataForTesting.server;
    tablesOwner = dataForTesting.tablesOwner;
    adminSettings = dataForTesting.container.resolve<IAdminSettings>(ADMIN_SETTINGS);
  });

  afterAll(async (): Promise<void> => {
    await tablesOwner.clean();
  });

  test('sign up', async (): Promise<void> => {
    const response = await request(server).post('/auth/sign-up').send(signUpData);
    expect(response.status).toBe(HttpStatus.CREATED);

    const cookies = response.headers['set-cookie'] as unknown as string[];
    const hasSession = cookies.some((cookie): boolean => cookie.startsWith('session'));
    expect(hasSession).toBe(true);
  });

  test('sign out', async (): Promise<void> => {
    const testSessionCookie = 'session=testSession; Path=/; HttpOnly';
    const response = await request(server).post('/auth/sign-out').set('Cookie', testSessionCookie);

    expect(response.status).toBe(HttpStatus.NO_CONTENT);

    const cookies = response.headers['set-cookie'] as unknown as string[];
    const hasSession = cookies.some(
      (cookie): boolean =>
        cookie.startsWith('session') && cookie.includes('Expires=Thu, 01 Jan 1970 00:00:00 GMT'),
    );

    expect(hasSession).toBe(true);
  });

  test('sign in', async (): Promise<void> => {
    const response = await request(server).post('/auth/sign-in').send(signInData);
    expect(response.status).toBe(HttpStatus.NO_CONTENT);

    const cookies = response.headers['set-cookie'] as unknown as string[];
    const hasSession = cookies.some((cookie): boolean => cookie.startsWith('session'));
    expect(hasSession).toBe(true);
  });

  test('sign in by admin data', async (): Promise<void> => {
    const adminSignInData: SignInDTO = {
      emailOrUsername: adminSettings.email,
      password: adminSettings.password,
    };

    const response = await request(server).post('/auth/sign-in').send(adminSignInData);
    expect(response.status).toBe(HttpStatus.NO_CONTENT);

    const cookies = response.headers['set-cookie'] as unknown as string[];
    const hasSession = cookies.some((cookie): boolean => cookie.startsWith('session'));
    expect(hasSession).toBe(true);
  });
});
