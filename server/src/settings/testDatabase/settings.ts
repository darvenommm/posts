import { injectable } from 'inversify';

import { isIP, isPort } from 'validator';

import type { IDatabaseSettings } from '../database/types';

@injectable()
export class TestDatabaseSettings implements IDatabaseSettings {
  public get host(): string {
    const host = process.env.FAKE_DB_HOST;

    if (!host || !isIP(host)) {
      throw new Error('The FAKE_DB_HOST is incorrect or not found');
    }

    return host;
  }

  public get port(): number {
    const port = process.env.FAKE_DB_PORT;

    if (!port || !isPort(port)) {
      throw new Error('The FAKE_DB_PORT is incorrect or not found');
    }

    return Number(port);
  }

  public get name(): string {
    const name = process.env.FAKE_DB_NAME;

    if (!name) {
      throw new Error('The FAKE_DB_NAME is not found');
    }

    return name;
  }

  public get username(): string {
    const username = process.env.FAKE_DB_USERNAME;

    if (!username) {
      throw new Error('The FAKE_DB_USERNAME is not found');
    }

    return username;
  }

  public get password(): string {
    const password = process.env.FAKE_DB_PASSWORD;

    if (!password) {
      throw new Error('The FAKE_DB_PASSWORD is not found');
    }

    return password;
  }
}
