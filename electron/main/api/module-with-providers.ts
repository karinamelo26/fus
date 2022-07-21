import { Class } from 'type-fest';

import { Provider } from '../di/provider';

export class ModuleWithProviders {
  constructor(public readonly module: Class<any>, public readonly providers?: Array<Class<any> | Provider>) {}
}
