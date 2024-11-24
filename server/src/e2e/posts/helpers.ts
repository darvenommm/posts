import { default as request } from 'supertest';

import { addUser } from '../auth/helpers';
import { createDTO } from './testData';

import type { Express } from 'express';
import type { CreateResult } from '@/domains/posts';

interface AddPostResult {
  readonly slug: string;
  readonly sessionCookie: string;
}

export const addPost = async (server: Express): Promise<AddPostResult> => {
  const { sessionCookie } = await addUser(server);

  const response = await request(server)
    .post('/posts')
    .send(createDTO)
    .set('Cookie', sessionCookie);

  const { slug }: CreateResult = JSON.parse(response.text);

  return { slug, sessionCookie };
};
