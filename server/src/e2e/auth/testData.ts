import type { SignInDTO, SignUpDTO } from '@/domains/auth';

export const signUpDTO: SignUpDTO = {
  id: 'f9a50b44-901e-40c4-b5e6-f6be642e6770',
  email: 'test@gmail.com',
  username: 'testUsername',
  password: 'testPassword',
} as const;

export const signInDTO: SignInDTO = {
  emailOrUsername: 'testUsername',
  password: 'testPassword',
} as const;
