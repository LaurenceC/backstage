import { createServiceBuilder } from '@backstage/backend-common';
import { Server } from 'http';
import { Logger } from 'winston';
import Router from 'express-promise-router';
import { Config } from '@backstage/config';
import {
  DatabaseManager,
  ServerTokenManager,
  SingleHostDiscovery,
} from '@backstage/backend-common';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { ScmIntegrations } from '@backstage/integration';
import auth from './plugins/auth';
import catalog from './plugins/catalog';
import events from './plugins/events';
import { PluginEnvironment } from './types';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
  config: Config;
}

async function createEnv(config: Config, logger: Logger): Promise<PluginEnvironment> {
  const discovery = SingleHostDiscovery.fromConfig(config);
  const databaseManager = DatabaseManager.fromConfig(config);
  const tokenManager = ServerTokenManager.noop();
  const integrations = ScmIntegrations.fromConfig(config);

  return {
    logger,
    database: await databaseManager.forPlugin('catalog'),
    cache: {
      getClient: () => {
        throw new Error('Cache not implemented');
      },
    },
    config,
    discovery,
    integrations,
    tokenManager,
    identity: {
      getIdentity: async () => undefined,
    },
    permissions: {
      authorize: async (requests) => requests.map(() => ({ result: AuthorizeResult.ALLOW })),
      authorizeConditional: async (requests) =>
        requests.map(() => ({ result: AuthorizeResult.ALLOW })),
    },
  };
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'backend' });
  const env = await createEnv(options.config, logger);
  const router = Router();

  router.use('/api/auth', await auth(env));
  router.use('/api/catalog', await catalog(env));
  router.use('/api/events', await events(env));

  const service = createServiceBuilder(module)
    .setPort(options.port)
    .enableCors({ origin: 'http://localhost:7007' })
    .addRouter('', router);

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}