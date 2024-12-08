import { Logger } from 'winston';
import { Config } from '@backstage/config';
import {
  PluginCacheManager,
  PluginDatabaseManager,
  PluginEndpointDiscovery,
  TokenManager,
} from '@backstage/backend-common';
import { IdentityApi } from '@backstage/plugin-auth-node';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';
import { ScmIntegrations } from '@backstage/integration';

export type PluginEnvironment = {
  logger: Logger;
  database: PluginDatabaseManager;
  cache: PluginCacheManager;
  config: Config;
  integrations: ScmIntegrations;
  discovery: PluginEndpointDiscovery;
  tokenManager: TokenManager;
  identity: IdentityApi;
  permissions: PermissionEvaluator;
};