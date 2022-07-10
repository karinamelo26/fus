import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { isNil, isObject } from 'st-utils';
import { Class } from 'type-fest';

import { Controller, ControllerMetadata, MethodMetadata } from './api/controller';
import { Module, ModuleOptions } from './api/module';
import { injector as injectorInstance, Injector } from './di/injector';
import { ClassProvider, isProvider } from './di/provider';

interface ParameterResolved {
  error?: any;
  data: any;
}

export class Api {
  private constructor(private readonly moduleMetadata: ModuleOptions, private readonly injector: Injector) {}

  private readonly _paths: string[] = [];

  private _createHandler(
    instance: any,
    methodMetadata: MethodMetadata
  ): (event: IpcMainInvokeEvent, ...args: any[]) => Promise<void> | any {
    return async (_, ...args: unknown[]) => {
      const parametersPromises: Promise<ParameterResolved>[] = args.map(async (arg, index) => {
        const metadata = methodMetadata.parameters.get(index);
        if (!metadata) {
          return { data: arg };
        }
        if (isNil(arg) && !metadata.optional) {
          // TODO add class for "http" error
          return { data: null, error: new Error('Has error') };
        }
        if (!isObject(arg) || !metadata.type) {
          return { data: arg };
        }
        const paramInstance: object | any[] = plainToInstance(metadata.type, arg);
        await validate(paramInstance, { whitelist: true });
        return { data: paramInstance };
      });
      const parameters = await Promise.all(parametersPromises);
      const errors = parameters.filter(parameter => parameter.error);
      if (errors.length) {
        // TODO add class for generic error
        throw new Error('Has errors');
      }
      const data = parameters.map(parameter => parameter.data);
      return await instance[methodMetadata.propertyKey](...data);
    };
  }

  private _initController(controllerMetadata: ControllerMetadata): void {
    const instance = this.injector.get(controllerMetadata.target);
    for (const [, methodMetadata] of controllerMetadata.methods) {
      const path = `${controllerMetadata.path}/${methodMetadata.path}`;
      this._paths.push(path);
      ipcMain.handle(path, this._createHandler(instance, methodMetadata));
      console.log(`[${path}] Initialized`);
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
    const providers = (this.moduleMetadata.providers ?? []).filter(isProvider);
    const controllers = this.moduleMetadata.controllers ?? [];
    const controllersProviders = controllers.map(controller => new ClassProvider(controller, controller));
    this.injector.addProviders([...providers, ...controllersProviders]);
    await this.injector.resolveAll();
    await this._initControllers(controllers);
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
