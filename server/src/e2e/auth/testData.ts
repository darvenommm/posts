import { v4 as createUUID } from 'uuid';

import type { SignInDTO, SignUpDTO } from '@/domains/auth/dtos';

export const signUpData: SignUpDTO = {
  id: createUUID(),
  email: 'some@gmail.com',
  username: 'username',
  password: 'password',
};

export const signInData: SignInDTO = {
  emailOrUsername: 'username',
  password: 'password',
};
