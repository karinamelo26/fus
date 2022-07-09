import { Class } from 'type-fest';

import { injector } from './di/injector';
import { Module } from './di/module';
import { isProvider } from './di/provider';

export async function bootstrap(module: Class<any>): Promise<void> {
  const metadata = Module.getMetadata(module);
  const providers = (metadata?.providers ?? []).filter(isProvider);
  injector.addProviders(providers);
  await injector.resolveAll();
}
