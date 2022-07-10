import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { Class } from 'type-fest';

import { Controller, ControllerMetadata, MethodMetadata } from './api/controller';
import { Module, ModuleOptions } from './api/module';
import { injector as injectorInstance, Injector } from './di/injector';
import { ClassProvider, isProvider } from './di/provider';

export class Api {
  private constructor(private readonly moduleMetadata: ModuleOptions, private readonly injector: Injector) {}

  private readonly _paths: string[] = [];

  private _createHandler(
    instance: any,
    methodMetadata: MethodMetadata
  ): (event: IpcMainInvokeEvent, ...args: any[]) => Promise<void> | any {
    return async (_, arg) => {
      // TODO transform and validate the arg according to the Data param
      return await instance[methodMetadata.propertyKey](arg);
    };
  }

  private _initController(controllerMetadata: ControllerMetadata): void {
    const instance = this.injector.get(controllerMetadata.target);
    for (const [, methodMetadata] of controllerMetadata.methods) {
      const path = `${controllerMetadata.path}/${methodMetadata.path}`;
      this._paths.push(path);
      ipcMain.handle(path, this._createHandler(instance, methodMetadata));
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
