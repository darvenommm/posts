import { createContainer } from 'awilix';

import { addBaseDependencies, addCompositeDependencies } from './container';
import { addPostsDependencies } from './domains/posts';
import { addAuthDependencies } from './domains/auth';

import { APPLICATION, type Application } from './app';
import { DATABASE_TABLES_CREATOR } from './database';

import type { TablesCreator } from './base/tableCreator';

const container = createContainer({ strict: true });
addBaseDependencies(container);
addAuthDependencies(container);
addPostsDependencies(container);
addCompositeDependencies(container);

try {
  await container.resolve<TablesCreator>(DATABASE_TABLES_CREATOR).create();

  container.resolve<Application>(APPLICATION).start();
} catch (error) {
  console.error(error);
} finally {
  await container.dispose();
}
