import { ContainerModule } from 'inversify';

import { ADMIN_SETTINGS, AdminSettings, type IAdminSettings } from './admin';
import { DATABASE_SETTINGS, DatabaseSettings, type IDatabaseSettings } from './database';
import { EXTRA_SETTINGS, ExtraSettings, type IExtraSettings } from './extra';
import { SERVER_SETTINGS, ServerSettings, type IServerSettings } from './server';

export const settingsModule = new ContainerModule((bind): void => {
  bind<IAdminSettings>(ADMIN_SETTINGS).to(AdminSettings);
  bind<IDatabaseSettings>(DATABASE_SETTINGS).to(DatabaseSettings);
  bind<IExtraSettings>(EXTRA_SETTINGS).to(ExtraSettings);
  bind<IServerSettings>(SERVER_SETTINGS).to(ServerSettings);
});
