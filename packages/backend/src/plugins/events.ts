import { EventsBackend } from '@backstage/plugin-events-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const router = Router();
  const eventsBackend = new EventsBackend(env.logger);
  await eventsBackend.start();

  return router;
}