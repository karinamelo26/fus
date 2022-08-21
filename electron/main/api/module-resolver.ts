import { isPlainObject } from 'st-utils';
import { Class } from 'type-fest';

import { Injector } from '../di/injector';
import { resolveProvider } from '../di/provider';
import { isClass } from '../util/util';

import { Module, ModuleOptions } from './module';
import { ModuleWithProviders } from './module-with-providers';

type ModuleWithoutImports = Required<Omit<ModuleOptions, 'imports'>>;

export class ModuleResolver {
  private constructor(private readonly injector: Injector, private readonly moduleMetadata: ModuleOptions) {}

  private readonly _moduleSet = new Map<any, ModuleWithoutImports>();
  private _controllers: Class<any>[] = [];

  private _getAllOptionsFromModule(module: Class<any> | ModuleWithProviders): ModuleWithoutImports {
    if (this._moduleSet.has(module)) {
      return this._moduleSet.get(module)!;
    }
    if (!isClass(module) && isPlainObject(module)) {
      /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
         --
         typescript thinks this is a ModuleWithProviders instance, but it could be a plain object also
      */
      if (module.module) {
        module = new ModuleWithProviders(module.module, module.providers ?? []);
      } else {
        throw new Error(
          `${JSON.stringify(
            module
          )} is not a Class nor a ModuleWithProviders. Remember to return a instance of ModuleWithProviders on static methods of Modules`
        );
      }
    }
    const moduleClass = module instanceof ModuleWithProviders ? module.module : module;
    const moduleMetadata = Module.getMetadata(moduleClass);
    if (!moduleMetadata) {
      return this._moduleSet.set(module, { providers: [], controllers: [] }).get(module)!;
    }
    const moduleWithProvidersProviders = module instanceof ModuleWithProviders ? module.providers : [];
    const moduleOptionsChildren = this._getAllOptionsFromModules(moduleMetadata.imports ?? []);
    const providers = [
      ...(moduleMetadata.providers ?? []),
      ...(moduleWithProvidersProviders ?? []),
      ...moduleOptionsChildren.providers,
    ];
    const controllers = [...(moduleMetadata.controllers ?? []), ...moduleOptionsChildren.controllers];
    return this._moduleSet.set(module, { providers, controllers }).get(module)!;
  }

  private _getAllOptionsFromModules(modules: Array<Class<any> | ModuleWithProviders>): ModuleWithoutImports {
    return modules.reduce(
      (options, module) => {
        const moduleOptions = this._getAllOptionsFromModule(module);
        return {
          providers: [...options.providers, ...moduleOptions.providers],
          controllers: [...options.controllers, ...moduleOptions.controllers],
        };
      },
      { providers: [], controllers: [] } as ModuleWithoutImports
    );
  }

  private _getChildrenModuleOptions(): ModuleWithoutImports {
    return this._getAllOptionsFromModules(this.moduleMetadata.imports ?? []);
  }

  async resolveAll(): Promise<this> {
    const childrenModules = this._getChildrenModuleOptions();
    const providers = [...(this.moduleMetadata.providers ?? []), ...childrenModules.providers].map(resolveProvider);
    const controllers = [...(this.moduleMetadata.controllers ?? []), ...childrenModules.controllers];
    this._controllers = controllers;
    const controllersProviders = controllers.map(resolveProvider);
    this.injector.addProviders([...providers, ...controllersProviders]);
    await this.injector.resolveAll();
    return this;
  }

  getControllers(): Class<any>[] {
    return [...this._controllers];
  }

  static create(injector: Injector, module: Class<any>): ModuleResolver {
    const metadata = Module.getMetadata(module);
    if (!metadata) {
      throw new Error(`Module "${module.name}" not configured. Did you forget to put the @Module decorator?`);
    }
    return new ModuleResolver(injector, metadata);
  }

  static createTest(injector: Injector, metadata: ModuleOptions): ModuleResolver {
    @Module(metadata)
    class TestModule {}
    return this.create(injector, TestModule);
  }
}
