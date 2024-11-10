import { beforeAll, describe, test, expect, afterAll } from 'bun:test';
import { default as request } from 'supertest';

import { HttpStatus } from 'http-enums';

import { ADMIN_SETTINGS, type IAdminSettings } from '@/settings/admin';
import { USERNAME_CONSTRAINTS, PASSWORD_CONSTRAINTS } from '@/domains/auth';
import { startTesting } from '../testHelpers';
import { addAuthDependenciesForTesting } from './addAuthDependencies';
import { signUpData, signInData } from './testData';

import type { Express } from 'express';
import type { TablesOwner } from '@/base/tablesOwner';

let server: Express;
let tablesOwner: TablesOwner;
let adminSettings: IAdminSettings;

const shortUsername = Array.from({ length: USERNAME_CONSTRAINTS.minLength - 1 })
  .map((): string => 'a')
  .join('');

const longUsername = Array.from({ length: USERNAME_CONSTRAINTS.maxLength + 1 })
  .map((): string => 'a')
  .join('');

const shortPassword = Array.from({ length: PASSWORD_CONSTRAINTS.minLength - 1 })
  .map((): string => 'a')
  .join('');

const longPassword = Array.from({ length: PASSWORD_CONSTRAINTS.maxLength + 1 })
  .map((): string => 'a')
  .join('');

describe('Auth endpoints with incorrect data', (): void => {
  beforeAll(async (): Promise<void> => {
    const dataForTesting = await startTesting(addAuthDependenciesForTesting);

    server = dataForTesting.server;
    tablesOwner = dataForTesting.tablesOwner;
    adminSettings = dataForTesting.container.resolve<IAdminSettings>(ADMIN_SETTINGS);
  });

  afterAll(async (): Promise<void> => {
    await tablesOwner.clean();
  });

  test('sign up incorrect email', async (): Promise<void> => {
    const incorrectEmail = await request(server)
      .post('/auth/sign-up')
      .send({ ...signUpData, email: 'skldfj' });
    expect(incorrectEmail.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  test('sign up incorrect username', async (): Promise<void> => {
    const incorrectShortUsername = await request(server)
      .post('/auth/sign-up')
      .send({ ...signUpData, username: shortUsername });
    expect(incorrectShortUsername.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    const incorrectLongUsername = await request(server)
      .post('/auth/sign-up')
      .send({ ...signUpData, username: longUsername });
    expect(incorrectLongUsername.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    const incorrectUsernameFormat = await request(server)
      .post('/auth/sign-up')
      .send({ ...signUpData, username: 'df  dfkj #$#$ d' });
    expect(incorrectUsernameFormat.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  test('sign up incorrect password', async (): Promise<void> => {
    const incorrectShortPassword = await request(server)
      .post('/auth/sign-up')
      .send({ ...signUpData, password: shortPassword });
    expect(incorrectShortPassword.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    const incorrectLongPassword = await request(server)
      .post('/auth/sign-up')
      .send({ ...signUpData, password: longPassword });
    expect(incorrectLongPassword.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  test('sign in incorrect emailOrUsername', async (): Promise<void> => {
    // signInValidator if emailOrUsername is not email -> check like username
    const incorrectShortUsername = await request(server)
      .post('/auth/sign-in')
      .send({ ...signInData, emailOrUsername: shortUsername });
    expect(incorrectShortUsername.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    const incorrectLongUsername = await request(server)
      .post('/auth/sign-in')
      .send({ ...signInData, emailOrUsername: longUsername });
    expect(incorrectLongUsername.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    const incorrectUsernameFormat = await request(server)
      .post('/auth/sign-in')
      .send({ ...signInData, emailOrUsername: 'df  ddfkj #$#$ d' });
    expect(incorrectUsernameFormat.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  test('sign in incorrect password', async (): Promise<void> => {
    const incorrectShortPassword = await request(server)
      .post('/auth/sign-up')
      .send({ ...signInData, password: shortPassword });
    expect(incorrectShortPassword.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    const incorrectLongPassword = await request(server)
      .post('/auth/sign-up')
      .send({ ...signInData, password: longPassword });
    expect(incorrectLongPassword.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(incorrectLongPassword);
  });
});
