import '@abraham/reflection';

import { container } from './container';
import { Application } from './app';

container.bind(Application).toSelf();

await container.get(Application).start();
