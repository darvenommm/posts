import '@abraham/reflection';

import { injectable } from 'inversify';
import { checkSchema } from 'express-validator';

import { Validator } from '@/base/validator';
import { USERNAME_CONSTRAINTS, PASSWORD_CONSTRAINTS } from '../constraints';

import type { ValidationChain } from 'express-validator';

export const SIGN_UP_VALIDATOR = Symbol('SignUpValidator');

@injectable()
export class SignUpValidator extends Validator {
  protected getValidators(): ValidationChain[] {
    return checkSchema({
      id: {
        trim: true,
        notEmpty: {
          errorMessage: 'The id cannot be empty',
        },
        isUUID: {
          options: 4,
          errorMessage: 'The id should be an uuid',
        },
      },
      email: {
        trim: true,
        escape: true,
        notEmpty: {
          errorMessage: 'The email cannot be empty',
        },
        isEmail: {
          errorMessage: 'Invalid email format',
        },
        normalizeEmail: true,
      },
      username: {
        trim: true,
        escape: true,
        notEmpty: {
          errorMessage: 'The username cannot be empty',
        },
        isLength: {
          options: { min: USERNAME_CONSTRAINTS.minLength, max: USERNAME_CONSTRAINTS.maxLength },
          errorMessage: `The username must be between ${USERNAME_CONSTRAINTS.minLength} and ${USERNAME_CONSTRAINTS.maxLength} characters long`,
        },
        matches: {
          options: USERNAME_CONSTRAINTS.getPattern(),
          errorMessage: `User format should be like ${USERNAME_CONSTRAINTS.getBeautifulPatternView()}`,
        },
      },
      password: {
        trim: true,
        notEmpty: {
          errorMessage: 'The password cannot be empty',
        },
        isLength: {
          options: { min: PASSWORD_CONSTRAINTS.minLength, max: PASSWORD_CONSTRAINTS.maxLength },
          errorMessage: `The password must be between ${PASSWORD_CONSTRAINTS.minLength} and ${PASSWORD_CONSTRAINTS.maxLength} characters long`,
        },
      },
    });
  }
}
