import type { SignInDTO, SignUpDTO } from '@/domains/auth/dtos';

export const signUpData: SignUpDTO = {
  email: 'some@gmail.com',
  username: 'username',
  password: 'password',
};

export const signInData: SignInDTO = {
  emailOrUsername: 'username',
  password: 'password',
};
