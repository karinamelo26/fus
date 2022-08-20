import { performance } from 'perf_hooks';

import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { isArray, isNil, isObject } from 'st-utils';
import { Class } from 'type-fest';

import { InjectionToken } from '../di/injection-token';
import { Injector } from '../di/injector';
import { Logger } from '../logger/logger';
import { AnyObject } from '../util/any-object.type';
import { calculateAndFormatPerformanceTime } from '../util/format-performance-time';

import { Controller, ControllerMetadata, MethodMetadata } from './controller';
import { BadRequestException, Exception, InternalServerErrorException, NotFoundException } from './exception';
import { ModuleResolver } from './module-resolver';
import { Response } from './response';
import { validateData } from './validate-data';

interface ParameterResolved {
  errors?: string[];
  data: any;
}

export class Api {
  private constructor(private readonly injector: Injector, private readonly moduleResolver: ModuleResolver) {}

  private readonly _logger = Logger.create(this);
  private readonly _paths: string[] = [];

  private _createHandler(
    path: string,
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
        this._logger.error(`Error on ${path}\n`, error);
        if (error instanceof Exception) {
          return error;
        } else if (error instanceof Prisma.NotFoundError) {
          return new NotFoundException(error.message);
        }
        return new InternalServerErrorException(error?.message ?? error?.error ?? 'Unknown error');
      }
    };
  }

  private _initController(controllerMetadata: ControllerMetadata): void {
    const instance = this.injector.get(controllerMetadata.target);
    for (const [, methodMetadata] of controllerMetadata.methods) {
      const startMs = performance.now();
      const path = `${controllerMetadata.path}/${methodMetadata.path}`;
      this._paths.push(path);
      ipcMain.handle(path, this._createHandler(path, instance, methodMetadata));
      const endMs = performance.now();
      this._logger.log(`[${path}] Initialized`, ...calculateAndFormatPerformanceTime(startMs, endMs));
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

  get<T>(target: InjectionToken<T>): T;
  get<T>(target: Class<T>): T;
  get<T>(target: any): T {
    return this.injector.get(target);
  }

  async init(): Promise<this> {
    const startMs = performance.now();
    await this.moduleResolver.resolveAll();
    const controllers = this.moduleResolver.getControllers();
    await this._initControllers(controllers);
    this._logger.log('API Initialized', ...calculateAndFormatPerformanceTime(startMs, performance.now()));
    return this;
  }

  static create(module: Class<any>): Api {
    const injector = Injector.create();
    return new Api(injector, ModuleResolver.create(injector, module));
  }
}
