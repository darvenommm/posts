import { injectable } from 'inversify';
import { isInt } from 'validator';

import type { IExtraSettings } from './types';

export const EXTRA_SETTINGS = Symbol('ExtraSettings');

@injectable()
export class ExtraSettings implements IExtraSettings {
  public get secret(): string {
    const secret = process.env.SECRET;

    if (!secret) {
      throw new Error('The SECRET is not found');
    }

    return secret;
  }

  public get saltRounds(): number {
    const saltRounds = process.env.SALT_ROUNDS ?? '10';

    if (!saltRounds || !isInt(saltRounds, { gt: 0 })) {
      throw new Error('The SALT_ROUNDS is incorrect or not found');
    }

    return Number(saltRounds);
  }
}
