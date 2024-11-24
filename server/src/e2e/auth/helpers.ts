import { default as request } from 'supertest';

import { signUpDTO } from './testData';

import type { Express } from 'express';

interface AddUserResult {
  readonly sessionCookie: string;
}

export const addUser = async (server: Express): Promise<AddUserResult> => {
  const response = await request(server).post('/auth/sign-up').send(signUpDTO);

  const cookies = response.headers['set-cookie'][0];
  const sessionCookie = cookies.split(';')[0];

  return { sessionCookie };
};
