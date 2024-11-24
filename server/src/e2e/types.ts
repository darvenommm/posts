import type { Container } from 'inversify';
import type { Express } from 'express';

import type { IDatabase } from '@/database';

export interface Dependencies {
  readonly container: Container;
  readonly server: Express;
  readonly database: IDatabase;
}
