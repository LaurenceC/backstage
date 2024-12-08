import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create({
    ...env,
    reader: {
      readTree: async () => {
        throw new Error('readTree not implemented');
      },
      readUrl: async () => ({
        buffer: async () => Buffer.from(''),
        etag: 'not-implemented',
        stream: () => {
          throw new Error('stream not implemented');
        },
      }),
      search: async () => ({
        files: [],
        etag: 'not-implemented'
      }),
    },
  });

  builder.addProcessor(new ScaffolderEntitiesProcessor());

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();

  return router;
}