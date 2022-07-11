import { plainToInstance } from 'class-transformer';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { isArray, isNil, isObject } from 'st-utils';
import { Class } from 'type-fest';

import { injector as injectorInstance, Injector } from '../di/injector';
import { ClassProvider, isProvider } from '../di/provider';
import { AnyObject } from '../util/any-object.type';

import { Controller, ControllerMetadata, MethodMetadata } from './controller';
import { BadRequestException, Exception, InternalServerErrorException } from './exception';
import { Module, ModuleOptions } from './module';
import { Response } from './response';
import { validateData } from './validate-data';

interface ParameterResolved {
  errors?: string[];
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
      async function handle(): Promise<Response> {
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
          throw new BadRequestException(errorsFormatted);
        }
        const argsFormatted = parameters.map(parameter => parameter.data);
        const data = await instance[methodMetadata.propertyKey](...argsFormatted);
        return new Response({ data, success: true, statusCode: methodMetadata.code });
      }
      let result: Response;
      try {
        result = await handle();
      } catch (error) {
        if (error instanceof Exception) {
          result = error;
        } else {
          result = new InternalServerErrorException(error?.message ?? error?.error ?? 'Unknown error');
        }
      }
      return result;
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
