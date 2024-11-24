import '@abraham/reflection';

import { getContainer } from './container';
import { APPLICATION, type IApplication } from './app';
import { authModule } from './domains/auth';
import { postsModule } from './domains/posts';
import { DATABASE_TABLES_OWNER } from './database';
import type { TablesOwner } from './base/tablesOwner';

const container = getContainer();
container.load(authModule, postsModule);

await container.get<TablesOwner>(DATABASE_TABLES_OWNER).create();
await container.get<IApplication>(APPLICATION).start();
