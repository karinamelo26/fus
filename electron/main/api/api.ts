import { performance } from 'perf_hooks';

import { plainToInstance } from 'class-transformer';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { isArray, isNil, isObject, isPlainObject } from 'st-utils';
import { Class } from 'type-fest';

import { injector as injectorInstance, Injector } from '../di/injector';
import { ClassProvider, isProvider } from '../di/provider';
import { Logger } from '../logger/logger';
import { AnyObject } from '../util/any-object.type';
import { formatPerformanceTime } from '../util/format-performance-time';
import { isClass } from '../util/util';

import { Controller, ControllerMetadata, MethodMetadata } from './controller';
import { BadRequestException, Exception, InternalServerErrorException } from './exception';
import { Module, ModuleOptions, resolveProvider } from './module';
import { ModuleWithProviders } from './module-with-providers';
import { Response } from './response';
import { validateData } from './validate-data';

interface ParameterResolved {
  errors?: string[];
  data: any;
}

type ModuleWithoutImports = Required<Omit<ModuleOptions, 'imports'>>;

export class Api {
  private constructor(private readonly moduleMetadata: ModuleOptions, private readonly injector: Injector) {}

  private readonly _logger = Logger.create(this);
  private readonly _paths: string[] = [];
  private readonly _moduleSet = new Map<any, ModuleWithoutImports>();

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
          )} is not a Class nor a ModuleWithProviders. Remember to return a instance of ModuleWithProviders on static methods os Modules`
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
      ...(moduleWithProvidersProviders ?? []).map(resolveProvider),
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

  private _createHandler(
    instance: any,
    methodMetadata: MethodMetadata
  ): (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<void> | any {
    return async (_, ...args: unknown[]) => {
      try {
        const parametersPromises: Promise<ParameterResolved>[] = methodMetadata.parameters.map(
          async (metadata, index) => {
            const arg = args[index];
            if (!metadata) {
              return { data: arg };
            }
            if (isNil(arg) && !metadata.optional) {
              return { data: null, errors: [`Parameter at index ${index} is required`] };
            }
            if (metadata.isArray && !isArray(arg)) {
              return { data: null, errors: [`Parameter at index ${index} must be an Array`] };
            }
            if (!isObject(arg) || !metadata.type) {
              return { data: arg };
            }
            const paramInstance: AnyObject | AnyObject[] = plainToInstance(metadata.type, arg);
            const errors = await validateData(paramInstance);
            return { data: errors.length ? null : paramInstance, errors };
          }
        );
        const parameters = await Promise.all(parametersPromises);
        const errors = parameters.filter(parameter => parameter.errors?.length);
        if (errors.length) {
          const errorsFormatted = errors
            .reduce((acc, item) => [...acc, ...(item.errors ?? [])], [] as string[])
            .join(', ');
          return new BadRequestException(errorsFormatted);
        }
        const argsFormatted = parameters.map(parameter => parameter.data);
        const data = await instance[methodMetadata.propertyKey](...argsFormatted);
        return new Response({ data, success: true, statusCode: methodMetadata.code });
      } catch (error) {
        return error instanceof Exception
          ? error
          : new InternalServerErrorException(error?.message ?? error?.error ?? 'Unknown error');
      }
    };
  }

  private _initController(controllerMetadata: ControllerMetadata): void {
    const instance = this.injector.get(controllerMetadata.target);
    for (const [, methodMetadata] of controllerMetadata.methods) {
      const startMs = performance.now();
      const path = `${controllerMetadata.path}/${methodMetadata.path}`;
      this._paths.push(path);
      ipcMain.handle(path, this._createHandler(instance, methodMetadata));
      const endMs = performance.now();
      this._logger.log(`[${path}] Initialized`, ...formatPerformanceTime(startMs, endMs));
    }
  }

  private async _initControllers(controllers: Class<any>[]): Promise<void> {
    for (const controller of controllers) {
      const metadata = Controller.getMetadata(controller);
      if (!metadata) {
        throw new Error(
          `Controller "${controller.name}" do not has any metadata. Did you use the @Controller decorator?`
        );
      }
      this._initController(metadata);
    }
  }

  getPaths(): string[] {
    return [...this._paths];
  }

  async init(): Promise<this> {
    const startMs = performance.now();
    this._logger.log('Initializing API');
    const childrenModules = this._getChildrenModuleOptions();
    const providers = [...(this.moduleMetadata.providers ?? []), ...childrenModules.providers].filter(isProvider);
    const controllers = [...(this.moduleMetadata.controllers ?? []), ...childrenModules.controllers];
    const controllersProviders = controllers.map(controller => new ClassProvider(controller, controller));
    this.injector.addProviders([...providers, ...controllersProviders]);
    await this.injector.resolveAll();
    await this._initControllers(controllers);
    const endMs = performance.now();
    this._logger.log('API Initialized', ...formatPerformanceTime(startMs, endMs));
    return this;
  }

  static create(module: Class<any>): Api {
    const metadata = Module.getMetadata(module);
    if (!metadata) {
      throw new Error(`Module "${module.name}" not configured. Did you forget to put the @Module decorator?`);
    }
    return new Api(metadata, injectorInstance);
  }
}
